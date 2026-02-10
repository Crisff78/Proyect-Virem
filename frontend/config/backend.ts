import { Platform } from 'react-native';

// 🔥 TU IP REAL (la que vimos en ipconfig)
const LAN_IP = '192.168.137.1';

// Defaults según plataforma
const DEFAULT_BACKEND_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000'     // Web en tu PC
    : `http://${LAN_IP}:3000`;    // Celular Expo Go (misma red)

// Si usas emulador Android, 10.0.2.2 funciona, pero SOLO en emulador.
// Como tú quieres web + celular, el default será LAN_IP.
// Si algún día usas emulador, pon EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3000 en el .env.

export const BACKEND_URL =
  (process.env.EXPO_PUBLIC_BACKEND_URL && process.env.EXPO_PUBLIC_BACKEND_URL.trim()) ||
  DEFAULT_BACKEND_URL;

export const apiUrl = (path: string) =>
  `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;
