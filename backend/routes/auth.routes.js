const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

/**
 * ✅ Helper: convierte "DD/MM/YYYY" -> "YYYY-MM-DD"
 * - PostgreSQL trabaja mejor con YYYY-MM-DD
 * - Si la fecha no viene en DD/MM/YYYY, la devuelve igual.
 */
function ddmmyyyyToYyyyMmDd(fecha) {
  const parts = String(fecha || '').trim().split('/');
  if (parts.length !== 3) return String(fecha || '').trim();

  const [dd, mm, yyyy] = parts;

  if (!dd || !mm || !yyyy) return String(fecha || '').trim();

  // Validación mínima (solo números)
  if (!/^\d+$/.test(dd) || !/^\d+$/.test(mm) || !/^\d+$/.test(yyyy)) {
    return String(fecha || '').trim();
  }

  // Formato final
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

/**
 * ===============================
 * API: Registro (crea PACIENTE + USUARIO)
 * Endpoint: POST /api/auth/register
 * ===============================
 */
router.post('/register', async (req, res) => {
  const {
    nombres,
    apellidos,
    fechanacimiento,
    genero,
    cedula,
    telefono,
    email,
    password,
    especialidad,
  } = req.body;

  const esRegistroMedico = String(especialidad || '').trim() !== '';

  // ✅ Validación básica (backend)
  const camposObligatorios = [
    nombres,
    apellidos,
    cedula,
    telefono,
    email,
    password,
  ];

  if (!esRegistroMedico) {
    camposObligatorios.push(fechanacimiento, genero);
  }

  if (camposObligatorios.some((campo) => !campo)) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
  }

  try {
    // ✅ API: verificar si el email ya existe en la tabla usuario
    const existing = await pool.query('SELECT usuarioid FROM usuario WHERE email = $1', [
      String(email).toLowerCase().trim(),
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Ese correo ya está registrado.' });
    }

    // ✅ API: Hash de contraseña (bcrypt)
    const passwordhash = await bcrypt.hash(password, 10);

    // ✅ Convertir la fecha al formato compatible con PostgreSQL
    const fechaSQL = ddmmyyyyToYyyyMmDd(fechanacimiento);

    // ✅ Transacción: si falla algo, no guarda nada
    await pool.query('BEGIN');

    let perfilId = null;
    let perfil = 'paciente';
    let rolName = 'paciente';

    if (esRegistroMedico) {
      const insertMedico = await pool.query(
        `INSERT INTO medico (nombres, apellidos, especialidad, cedula, telefono, fecharegistro)
         VALUES ($1,$2,$3,$4,$5,NOW())
         RETURNING medicoid`,
        [
          String(nombres).trim(),
          String(apellidos).trim(),
          String(especialidad).trim(),
          String(cedula).trim(),
          String(telefono).trim(),
        ]
      );

      perfilId = insertMedico.rows[0].medicoid;
      perfil = 'medico';
      rolName = 'medico';
    } else {
      const insertPaciente = await pool.query(
        `INSERT INTO paciente (nombres, apellidos, fechanacimiento, genero, cedula, telefono, fecharegistro)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())
         RETURNING pacienteid`,
        [
          String(nombres).trim(),
          String(apellidos).trim(),
          fechaSQL,
          String(genero).trim(),
          String(cedula).trim(),
          String(telefono).trim(),
        ]
      );

      perfilId = insertPaciente.rows[0].pacienteid;
    }

    // ✅ Valores por defecto del usuario
    let rolid = Number(process.env.DEFAULT_ROLID || 1);
    const activo = String(process.env.DEFAULT_ACTIVO || 'true') === 'true';

    // ✅ Buscar rol según tipo de perfil (si existe en tabla rol)
    const rolResult = await pool.query(
      'SELECT rolid FROM rol WHERE LOWER(nombre) = $1 LIMIT 1',
      [rolName]
    );

    if (rolResult.rows.length > 0) {
      rolid = rolResult.rows[0].rolid;
    }

    // ✅ API: Insertar en tabla usuario
    const insertUsuario = await pool.query(
      `INSERT INTO usuario (rolid, email, passwordhash, fechacreacion, activo)
       VALUES ($1,$2,$3,NOW(),$4)
       RETURNING usuarioid`,
      [rolid, String(email).toLowerCase().trim(), passwordhash, activo]
    );

    await pool.query('COMMIT');

    return res.json({
      success: true,
      message: 'Registro completado.',
      perfil,
      perfilid: perfilId,
      usuarioid: insertUsuario.rows[0].usuarioid,
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error register:', err);
    return res.status(500).json({ success: false, message: 'Error interno registrando.' });
  }
});

/**
 * ===============================
 * API: Login (email + password)
 * Endpoint: POST /api/auth/login
 * ===============================
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: 'Email y password son obligatorios.' });
  }

  try {
    // ✅ API: Buscar usuario por email
    const result = await pool.query(
      `SELECT usuarioid, rolid, email, passwordhash, activo
       FROM usuario
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    const user = result.rows[0];

    if (!user.activo) {
      return res.status(403).json({ success: false, message: 'Usuario inactivo.' });
    }

    // ✅ API: Comparar contraseña (bcrypt)
    const ok = await bcrypt.compare(password, user.passwordhash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    // ✅ API: Generar token JWT
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Falta JWT_SECRET en el .env' });
    }

    const token = jwt.sign(
      { usuarioid: user.usuarioid, rolid: user.rolid, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login exitoso.',
      token,
      user: { usuarioid: user.usuarioid, rolid: user.rolid, email: user.email },
    });
  } catch (err) {
    console.error('Error login:', err);
    return res.status(500).json({ success: false, message: 'Error interno en login.' });
  }
});

module.exports = router;
