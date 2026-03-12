import { Platform } from 'react-native';

const ANDROID_HOST_CANDIDATES = ['localhost', '10.0.2.2'];
const DEFAULT_HOST = 'localhost';

export const API_BASE_URLS =
  Platform.OS === 'android'
    ? ANDROID_HOST_CANDIDATES.map((host) => `http://${host}:3000/api`)
    : [`http://${DEFAULT_HOST}:3000/api`];

export const API_BASE_URL = API_BASE_URLS[0];

export const DEMO_CREDENTIALS = {
  email: 'demo@languageguru.app',
  password: 'demo1234',
};
