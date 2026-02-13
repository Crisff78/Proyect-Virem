const express = require("express");
const rateLimit = require("express-rate-limit");
const { consultarExequaturSNS } = require("../services/exequatur.provider.js");

const router = express.Router();

// Anti abuso (porque es scraping)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

const nombreCompletoEsValido = (nombreCompleto) => {
  const tokens = String(nombreCompleto || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return tokens.length >= 2;
};

// =======================================
// ✅ VALIDAR EXEQUÁTUR POR NOMBRE COMPLETO (+ cédula opcional)
// Endpoint: POST /api/validar-exequatur
// =======================================
router.post("/validar-exequatur", limiter, async (req, res) => {
  const { cedula, nombreCompleto } = req.body;
  const nombre = String(nombreCompleto || "").trim();

  if (!nombreCompletoEsValido(nombre)) {
    return res.status(400).json({
      success: false,
      message: "Verifica el nombre completo tal como aparece en el SNS.",
    });
  }

  const result = await consultarExequaturSNS({
    cedula: String(cedula || "").trim(),
    nombreCompleto: nombre,
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
    match: result.match || null,
  });
});

// =======================================
// GET INFO
// =======================================
router.get("/validar-exequatur", (req, res) => {
  res.json({
    success: true,
    message:
      "Usa POST /api/validar-exequatur con JSON: { cedula: '057-0006582-3', nombreCompleto: 'Esperanza Morales de la Cruz' }",
  });
});

module.exports = router;
