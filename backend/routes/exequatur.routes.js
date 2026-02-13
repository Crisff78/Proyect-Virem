const express = require("express");
const rateLimit = require("express-rate-limit");
const { consultarExequaturSNS } = require("../services/exequatur.provider.js");

const router = express.Router();

// Anti abuso (porque es scraping)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

const splitNombreCompleto = (nombreCompleto) => {
  const tokens = String(nombreCompleto || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length < 2) {
    return null;
  }

  const apellidos = tokens[tokens.length - 1];
  const nombres = tokens.slice(0, -1).join(" ");

  return { nombres, apellidos };
};

// =======================================
// ✅ VALIDAR EXEQUÁTUR POR CÉDULA + NOMBRE COMPLETO
// Endpoint: POST /api/validar-exequatur
// =======================================
router.post("/validar-exequatur", limiter, async (req, res) => {
  const { cedula, nombreCompleto } = req.body;
  const parsedName = splitNombreCompleto(nombreCompleto);

  if (!parsedName) {
    return res.status(400).json({
      success: false,
      message: "Verifica el nombre completo tal como aparece en el SNS.",
    });
  }

  const result = await consultarExequaturSNS({
    cedula: String(cedula || "").trim(),
    nombres: parsedName.nombres,
    apellidos: parsedName.apellidos,
  });

  if (!result.ok) {
    return res.status(400).json({
      success: false,
      message: result.reason,
    });
  }

  return res.json({
    success: true,
    exists: result.exists,
    doctor: result.exists ? result.doctor : null,
  });
});

// =======================================
// GET INFO
// =======================================
router.get("/validar-exequatur", (req, res) => {
  res.json({
    success: true,
    message:
      "Usa POST /api/validar-exequatur con JSON: { cedula: '00112345678', nombreCompleto: 'Juan Perez' }",
  });
});

module.exports = router;
