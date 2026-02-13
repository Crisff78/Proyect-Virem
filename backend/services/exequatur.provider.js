const { chromium } = require("playwright");

const SNS_URL =
  "https://sns.gob.do/herramientas-de-consulta/consulta-de-exequatur/";

const DEBUG_EXEQUATUR = String(process.env.EXEQUATUR_DEBUG || "").toLowerCase() === "true";

const PARTICULAS = new Set(["de", "del", "la", "las", "los", "y", "da", "do", "dos", "das"]);

const logDebug = (...args) => {
  if (DEBUG_EXEQUATUR) {
    console.log("[EXEQUATUR DEBUG]", ...args);
  }
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value) =>
  normalizeText(value)
    .split(" ")
    .filter(Boolean);

const tokenizeWithoutParticles = (value) => tokenize(value).filter((t) => !PARTICULAS.has(t));

const tokenOverlapRatio = (aTokens, bTokens) => {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (!a.size || !b.size) return 0;

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }

  const denominator = Math.max(a.size, b.size);
  return denominator ? intersection / denominator : 0;
};

const levenshteinDistance = (a, b) => {
  const s = String(a || "");
  const t = String(b || "");

  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;

  const matrix = Array.from({ length: s.length + 1 }, () => Array(t.length + 1).fill(0));

  for (let i = 0; i <= s.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= t.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= s.length; i += 1) {
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[s.length][t.length];
};

const similarityRatio = (a, b) => {
  const s = normalizeText(a);
  const t = normalizeText(b);
  const maxLen = Math.max(s.length, t.length);
  if (!maxLen) return 0;
  const distance = levenshteinDistance(s, t);
  return 1 - distance / maxLen;
};

const buildDoctorFromRow = (cells) => {
  const clean = (idx) => String(cells[idx] || "").trim();

  return {
    nombre: clean(0),
    profesion: clean(1),
    universidad: clean(2),
    no_registro: clean(3),
    fecha_registro: clean(4),
    folio: clean(5),
    libro: clean(6),
    no_decreto: clean(7),
  };
};

const scoreCandidate = ({ targetName, candidateName, cedulaDigits, candidateRaw }) => {
  const targetNorm = normalizeText(targetName);
  const candidateNorm = normalizeText(candidateName);

  const targetTokens = tokenizeWithoutParticles(targetNorm);
  const candidateTokens = tokenizeWithoutParticles(candidateNorm);

  const scoreA = tokenOverlapRatio(targetTokens, candidateTokens);
  const scoreB =
    targetNorm && candidateNorm && (targetNorm.includes(candidateNorm) || candidateNorm.includes(targetNorm))
      ? 1
      : 0;
  const scoreC = similarityRatio(targetNorm, candidateNorm);

  let scoreCedula = 0;
  if (cedulaDigits) {
    const fromAllText = String(candidateRaw || "").replace(/\D/g, "");
    if (fromAllText.includes(cedulaDigits)) {
      scoreCedula = 1;
    }
  }

  const total = 0.5 * scoreA + 0.2 * scoreB + 0.25 * scoreC + 0.05 * scoreCedula;

  return {
    score: Number(total.toFixed(4)),
    detail: {
      scoreA: Number(scoreA.toFixed(4)),
      scoreB,
      scoreC: Number(scoreC.toFixed(4)),
      scoreCedula,
    },
    method: "token_overlap+includes+similarity",
  };
};

const waitForTablePopulation = async (page) => {
  const tableSelector = "table tbody tr";

  for (let i = 0; i < 10; i += 1) {
    const count = await page.locator(tableSelector).count().catch(() => 0);
    if (count > 0) return count;
    await page.waitForTimeout(500);
  }

  return 0;
};

const extractRows = async (page) => {
  const rows = await page.$$eval("table tbody tr", (trs) =>
    trs.map((tr) => Array.from(tr.querySelectorAll("td")).map((td) => (td.textContent || "").trim()))
  );
  return rows.filter((r) => r.some((c) => c));
};

/**
 * Consulta Exequátur Médico en SNS
 * Devuelve:
 * - ok:true exists:true doctor match
 * - ok:true exists:false
 * - ok:false reason
 */
async function consultarExequaturSNS({ cedula, nombreCompleto }) {
  const cedulaDigits = String(cedula || "").replace(/\D/g, "");
  const fullName = String(nombreCompleto || "").trim();

  if (!fullName) {
    return {
      ok: false,
      reason: "Verifica el nombre completo tal como aparece en el SNS.",
    };
  }

  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(SNS_URL, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    await page.waitForTimeout(1800);

    const inputCandidates = [
      'input[type="search"]',
      'input[placeholder*="Buscar" i]',
      'input[placeholder*="Cédula" i]',
      'input[placeholder*="Cedula" i]',
      'input[name*="search" i]',
      'input[name*="cedula" i]',
      'input[name*="nombre" i]',
      "input[type='text']",
    ];

    let input = null;
    for (const sel of inputCandidates) {
      const loc = page.locator(sel).first();
      if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
        input = loc;
        break;
      }
    }

    if (!input) {
      logDebug("No se encontró input de búsqueda");
      return { ok: false, reason: "No se encontró el campo de búsqueda en SNS." };
    }

    const query = fullName;
    logDebug("Query SNS:", query);

    await input.click().catch(() => {});
    await input.fill(query);

    const buttonCandidates = [
      'button:has-text("Buscar")',
      'button:has-text("CONSULTAR")',
      'button[type="submit"]',
      'input[type="submit"]',
    ];

    let clicked = false;
    for (const bsel of buttonCandidates) {
      const btn = page.locator(bsel).first();
      if ((await btn.count()) > 0 && (await btn.isVisible().catch(() => false))) {
        await btn.click().catch(() => {});
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      await input.press("Enter").catch(() => {});
    }

    await page.waitForTimeout(1800);

    const rowCount = await waitForTablePopulation(page);
    const countInfo = await page
      .locator(".dataTables_info, #table_info, .dt-info")
      .first()
      .textContent()
      .catch(() => "");

    logDebug("Cantidad de filas detectadas:", rowCount);
    logDebug("Texto de cantidad de registros:", String(countInfo || "").trim());

    if (rowCount > 0) {
      const rows = await extractRows(page);
      const candidates = rows.map((cells) => {
        const doctor = buildDoctorFromRow(cells);
        const score = scoreCandidate({
          targetName: fullName,
          candidateName: doctor.nombre,
          cedulaDigits,
          candidateRaw: cells.join(" "),
        });

        return {
          doctor,
          score,
          raw: cells,
        };
      });

      const sorted = candidates.sort((a, b) => b.score.score - a.score.score);
      const best = sorted[0];

      logDebug("Nombres parseados:", sorted.slice(0, 10).map((x) => x.doctor.nombre));
      logDebug(
        "Top scores:",
        sorted.slice(0, 5).map((x) => ({ nombre: x.doctor.nombre, ...x.score }))
      );

      const threshold = 0.75;
      if (best && best.score.score >= threshold) {
        return {
          ok: true,
          exists: true,
          doctor: best.doctor,
          match: {
            score: best.score.score,
            method: best.score.method,
            detail: best.score.detail,
          },
        };
      }

      return {
        ok: true,
        exists: false,
        match: best
          ? {
              score: best.score.score,
              method: best.score.method,
              detail: best.score.detail,
            }
          : null,
      };
    }

    const bodyText = await page.textContent("body").catch(() => "");
    const txt = normalizeText(bodyText);

    if (txt.includes("no") && (txt.includes("resultado") || txt.includes("encontr"))) {
      return { ok: true, exists: false };
    }

    return { ok: true, exists: false };
  } catch (err) {
    logDebug("Error consultando SNS:", err?.message || err);
    return {
      ok: false,
      reason: "No se pudo consultar Exequátur en SNS (sitio caído o cambió la página).",
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

module.exports = { consultarExequaturSNS };
