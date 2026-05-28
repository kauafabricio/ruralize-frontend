import axios, { AxiosError } from "axios";

export const API_BASE_URL = "https://rural-backend.vercel.app";
const SESSION_STORAGE_KEY = "ruralize.session";
const AUTH_COOKIE_NAME = "ruralize_auth";

export interface ApiErrorResponse {
  detail?: string;
}

interface StoredSession {
  token?: string;
  expiresAt?: number | null;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const session = getStoredSession();

  if (!session) {
    return config;
  }

  if (isSessionExpired(session.expiresAt)) {
    clearStoredSession();
    return config;
  }

  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      clearStoredSession();
    }

    throw new Error(
      error.response?.data?.detail ?? error.message ?? "Erro na requisicao",
    );
  },
);

function getStoredSession(): StoredSession | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as StoredSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

function clearStoredSession() {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

function isSessionExpired(expiresAt: number | null | undefined) {
  return Boolean(expiresAt && Date.now() >= expiresAt);
}

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
