import { Platform } from 'react-native';

const DEFAULT_BACKEND_URL =
  Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL;

export const apiUrl = (path: string) =>
  `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;
