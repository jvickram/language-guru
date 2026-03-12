import { Platform } from 'react-native';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = `http://${HOST}:3000/api`;

export const DEMO_CREDENTIALS = {
  email: 'demo@languageguru.app',
  password: 'demo1234',
};
