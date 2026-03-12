import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const initialAuthState = {
  user: null,
  token: null,
  isLoading: false,
  isBootstrapping: true,
  error: null,
};

const initialLessonsState = {
  items: [],
  progress: [],
  isLoading: false,
  error: null,
};

const authReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case 'AUTH_BOOTSTRAP_START':
    case 'AUTH_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_BOOTSTRAP_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isBootstrapping: false,
        error: null,
      };
    case 'AUTH_BOOTSTRAP_DONE':
      return { ...state, isLoading: false, isBootstrapping: false };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...initialAuthState, isBootstrapping: false };
    default:
      return state;
  }
};

const lessonsReducer = (state = initialLessonsState, action) => {
  switch (action.type) {
    case 'LESSONS_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'LESSONS_SUCCESS':
      return { ...state, isLoading: false, items: action.payload, error: null };
    case 'LESSONS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'PROGRESS_SUCCESS':
      return { ...state, progress: action.payload, error: null };
    case 'LESSONS_RESET':
      return { ...initialLessonsState };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  auth: authReducer,
  lessons: lessonsReducer,
});

const STORAGE_KEYS = {
  token: 'lg_token',
  user: 'lg_user',
};

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const bootstrapSession = () => async (dispatch) => {
  dispatch({ type: 'AUTH_BOOTSTRAP_START' });
  try {
    const [token, userJson] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.token),
      AsyncStorage.getItem(STORAGE_KEYS.user),
    ]);

    if (token && userJson) {
      dispatch({
        type: 'AUTH_BOOTSTRAP_SUCCESS',
        payload: { token, user: JSON.parse(userJson) },
      });
      return;
    }
  } catch (error) {
    dispatch({ type: 'AUTH_FAILURE', payload: 'Could not restore session' });
  }

  dispatch({ type: 'AUTH_BOOTSTRAP_DONE' });
};

const persistSession = async (token, user) => {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.token, token),
    AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user)),
  ]);
};

const authRequest = async (endpoint, payload) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data;
};

export const loginUser = (credentials) => async (dispatch) => {
  dispatch({ type: 'AUTH_REQUEST' });
  try {
    const data = await authRequest('/auth/login', credentials);
    await persistSession(data.token, data.user);
    dispatch({ type: 'AUTH_SUCCESS', payload: data });
  } catch (error) {
    dispatch({ type: 'AUTH_FAILURE', payload: error.message });
    throw error;
  }
};

export const registerUser = (payload) => async (dispatch) => {
  dispatch({ type: 'AUTH_REQUEST' });
  try {
    const data = await authRequest('/auth/register', payload);
    await persistSession(data.token, data.user);
    dispatch({ type: 'AUTH_SUCCESS', payload: data });
  } catch (error) {
    dispatch({ type: 'AUTH_FAILURE', payload: error.message });
    throw error;
  }
};

export const logoutUser = () => async (dispatch) => {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.token),
    AsyncStorage.removeItem(STORAGE_KEYS.user),
  ]);
  dispatch({ type: 'AUTH_LOGOUT' });
  dispatch({ type: 'LESSONS_RESET' });
};

export const fetchLessons = () => async (dispatch, getState) => {
  dispatch({ type: 'LESSONS_REQUEST' });
  try {
    const { token } = getState().auth;
    const response = await fetch(`${API_BASE_URL}/lessons`, {
      headers: authHeaders(token),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load lessons');
    }
    dispatch({ type: 'LESSONS_SUCCESS', payload: data.lessons || [] });
  } catch (error) {
    dispatch({ type: 'LESSONS_FAILURE', payload: error.message });
  }
};

export const fetchProgress = () => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    const response = await fetch(`${API_BASE_URL}/progress`, {
      headers: authHeaders(token),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load progress');
    }
    dispatch({ type: 'PROGRESS_SUCCESS', payload: data.progress || [] });
  } catch (error) {
    dispatch({ type: 'LESSONS_FAILURE', payload: error.message });
  }
};

export const submitProgress = (lessonId, score = 100) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ lessonId, completed: true, score }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update progress');
    }
    dispatch({ type: 'PROGRESS_SUCCESS', payload: data.progress || [] });
    dispatch(fetchLessons());
  } catch (error) {
    dispatch({ type: 'LESSONS_FAILURE', payload: error.message });
  }
};

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;