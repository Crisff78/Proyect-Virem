# Virem Backend + Frontend

Backend en Node.js + Express para autenticación y validación de teléfonos, y frontend en Expo/React Native.

## Requisitos
- Node.js 18+
- PostgreSQL 13+

## Configuración del backend (pgAdmin/PostgreSQL)
1. En pgAdmin crea la base de datos (por ejemplo `virem_db`) y ten a mano:
   - host, puerto, usuario y contraseña.
2. Copia el archivo de ejemplo de entorno en `backend`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Completa las variables en `backend/.env`:
   - Usa `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
   - Alternativamente puedes usar `DATABASE_URL` (si prefieres una cadena única).
4. Inicia el backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Configuración del frontend
1. Copia el archivo de ejemplo de entorno en `frontend`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
2. Ajusta `EXPO_PUBLIC_BACKEND_URL` si tu backend no corre en `http://localhost:3000`.
3. Inicia el frontend:
   ```bash
   cd frontend
   npm install
   npm run start
   ```

## Endpoints
### Salud
- `GET /health`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Usuarios (requiere JWT)
- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/me/password`

### Pacientes (requiere JWT)
- `GET /api/pacientes`
- `GET /api/pacientes/:id`
- `POST /api/pacientes`
- `PUT /api/pacientes/:id`
- `DELETE /api/pacientes/:id`

### Médicos (requiere JWT)
- `GET /api/medicos`
- `GET /api/medicos/:id`
- `POST /api/medicos`
- `PUT /api/medicos/:id`
- `DELETE /api/medicos/:id`

### Teléfono
- `POST /api/phone/validar-telefono`

## Notas de seguridad
- Usa `JWT_SECRET` fuerte.
<<<<<<< HEAD
- Ajusta límites y rate limiting según necesidad.
=======
- Ajusta límites y rate limiting según necesidad.
>>>>>>> 8aaa8bffcfaf7143212bd1402ee433e1978192d3
