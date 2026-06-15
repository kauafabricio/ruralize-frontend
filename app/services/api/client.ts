import axios, { AxiosError } from "axios";
import {
  getStoredSession,
  clearStoredSession,
  isSessionExpired,
  onSessionChange,
  SESSION_STORAGE_KEY,
  AUTH_COOKIE_NAME,
  type AuthSession,
} from "@/app/lib/auth";

export const API_BASE_URL = "https://rural-backend.vercel.app";

export interface ApiErrorResponse {
  detail?: string;
}

// Flag para rastrear se estamos tentando sincronizar após 401
let syncingAfter401 = false;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição: adiciona token JWT e X-User-Id
api.interceptors.request.use((config) => {
  const session = getStoredSession();

  if (!session) {
    return config;
  }

  if (isSessionExpired(session)) {
    clearStoredSession("sessão expirada");
    return config;
  }

  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  // Adicionar X-User-Id se disponível
  if (session.user?.id) {
    config.headers["X-User-Id"] = session.user.id;
  }

  return config;
});

// Interceptor de resposta: sincroniza 401 com AuthProvider
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401 && !syncingAfter401) {
      syncingAfter401 = true;

      // Limpar sessão e notificar AuthProvider
      clearStoredSession("erro 401 - token inválido");

      // Disparar evento customizado para AuthProvider detectar
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth:unauthorized", {
            detail: { message: "Token inválido ou expirado" },
          }),
        );
      }

      // Reset flag após um tempo
      setTimeout(() => {
        syncingAfter401 = false;
      }, 500);
    }

    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      const detail = error.response.data?.detail;

      const detailMessage =
        typeof detail === "string"
          ? detail
          : detail && typeof detail === "object" && "message" in detail
          ? String((detail as Record<string, unknown>).message)
          : typeof detail === "object"
          ? JSON.stringify(detail)
          : undefined;

      if (status === 503) {
        throw new Error(
          detailMessage ||
            "Servidor indisponível: verifique se o backend e o MongoDB estão em execução.",
        );
      }

      throw new Error(
        detailMessage || `${status} ${statusText}` || error.message || "Erro na requisição",
      );
    }

    if (error.request) {
      throw new Error(
        "Falha de rede: não foi possível conectar ao servidor. Verifique se o backend está em execução, se o MongoDB está disponível e se o CORS está configurado corretamente.",
      );
    }

    throw new Error(error.message || "Erro na requisição");
  },
);

// Sincronizar client.ts quando sessão muda em outro lugar
export function initializeSessionSync() {
  if (typeof window === "undefined") {
    return () => {};
  }

  // Listener para mudanças na sessão via callback
  const unsubscribe = onSessionChange((session: AuthSession | null) => {
    // Se a sessão foi limpa, limpar também a sessão em client.ts
    if (!session) {
      // A limpeza já foi feita em auth.ts, apenas sincronizar state
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth:session-cleared", {
            detail: { timestamp: Date.now() },
          }),
        );
      }
    }
  });

  return unsubscribe;
}
