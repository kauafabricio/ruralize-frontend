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
    const config = error.config;
    const method = config?.method?.toUpperCase() || "UNKNOWN";
    const url = config?.url || "UNKNOWN";

    // Determinar tipo de erro
    let errorMessage = "Erro ao fazer requisição";
    let errorType = "UNKNOWN_ERROR";

    if (error.response) {
      // Erro HTTP com resposta do servidor
      const status = error.response.status;
      errorType = `HTTP_${status}`;

      if (status === 401) {
        // Desautorizado
        errorMessage =
          error.response.data?.detail || "Sessão expirada. Faça login novamente.";
      } else if (status === 404) {
        // Não encontrado
        errorMessage =
          error.response.data?.detail ||
          `Recurso não encontrado em ${url}`;
      } else if (status === 400) {
        // Requisição inválida
        errorMessage =
          error.response.data?.detail ||
          "Requisição inválida. Verifique os dados enviados.";
      } else if (status === 500) {
        // Erro interno do servidor
        errorMessage =
          error.response.data?.detail ||
          "Erro interno do servidor. Tente novamente mais tarde.";
      } else {
        errorMessage =
          error.response.data?.detail || `Erro do servidor: ${status}`;
      }

      // Log estruturado para debug
      if (typeof window !== "undefined" && typeof console !== "undefined") {
        console.error(`[API_${status}] ${method} ${url}`, {
          status,
          detail: error.response.data?.detail,
          hasData: !!error.response.data,
        });
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta (timeout ou conexão recusada)
      errorType = "NO_RESPONSE";
      errorMessage =
        "Servidor não respondeu. Verifique sua conexão ou a disponibilidade do servidor.";

      if (typeof window !== "undefined" && typeof console !== "undefined") {
        console.error(`[API_NO_RESPONSE] ${method} ${url}`, {
          message: error.message,
          code: error.code,
        });
      }
    } else {
      // Erro ao configurar a requisição
      errorType = "REQUEST_SETUP_ERROR";
      errorMessage = error.message || "Erro ao configurar requisição";

      if (typeof window !== "undefined" && typeof console !== "undefined") {
        console.error(`[API_SETUP_ERROR] ${method} ${url}`, {
          message: error.message,
        });
      }
    }

    // Sincronizar 401 com AuthProvider
    if (error.response?.status === 401 && !syncingAfter401) {
      syncingAfter401 = true;

      clearStoredSession("erro 401 - token inválido");

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth:unauthorized", {
            detail: { message: "Token inválido ou expirado" },
          }),
        );
      }

      setTimeout(() => {
        syncingAfter401 = false;
      }, 500);
    }

    throw new Error(errorMessage);
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
