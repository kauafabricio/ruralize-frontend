import { loginUser } from "../services/api/auth.api";

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  raw?: Record<string, unknown>;
};

export type AuthSession = {
  token: string;
  user: AuthUser | null;
  expiresAt: number | null;
};

export type ProfileUpdatePayload = {
  name: string;
  email: string;
  roleDescription: string;
  bio: string;
  location: string;
  coverImageUrl: string;
  avatarUrl: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

type JsonRecord = Record<string, unknown>;

const SESSION_STORAGE_KEY = "ruralize.session";
const AUTH_COOKIE_NAME = "ruralize_auth";

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const data = await loginUser(credentials);
  return createSessionFromLoginResponse(data);
}

export function getStoredSession(): AuthSession | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!storedSession) {
    clearStoredSession();
    return null;
  }

  try {
    const session = JSON.parse(storedSession) as AuthSession;

    if (!isValidSessionShape(session) || isSessionExpired(session)) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function storeSession(session: AuthSession) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  writeAuthCookie(session);
}

export function clearStoredSession() {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function isSessionExpired(session: AuthSession) {
  return Boolean(session.expiresAt && Date.now() >= session.expiresAt);
}

export function getAuthorizationHeader(
  session: AuthSession | null,
): Record<string, string> {
  return session?.token
    ? { Authorization: `Bearer ${session.token}` }
    : {};
}

export async function updateProfileRequest(
  session: AuthSession | null,
  profile: ProfileUpdatePayload,
): Promise<AuthSession> {
  if (!session?.token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthorizationHeader(session),
    },
    body: JSON.stringify({
      profile,
      user: session.user,
    }),
  });

  const data = (await response.json().catch(() => null)) as {
    message?: string;
    user?: AuthUser;
  } | null;

  if (!response.ok || !data?.user) {
    throw new Error(data?.message ?? "Não foi possível salvar o perfil.");
  }

  return {
    ...session,
    user: data.user,
  };
}

function writeAuthCookie(session: AuthSession) {
  const maxAge = session.expiresAt
    ? Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
    : 60 * 60 * 24 * 7;

  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAge}; samesite=lax`;
}

function readString(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function createSessionFromLoginResponse(
  data: unknown,
): AuthSession {
  if (!isRecord(data)) {
    throw new Error("Resposta inválida da API.");
  }

  const token = readString(data, ["token", "access_token"]);

  if (!token) {
    throw new Error("Token não encontrado.");
  }

  const user = isRecord(data.user)
    ? {
        id: readString(data.user, ["id", "_id"]),
        name: readString(data.user, ["name", "username"]),
        email: readString(data.user, ["email"]),
        role: readString(data.user, ["role"]),
        avatarUrl: readString(data.user, ["avatar", "avatarUrl"]),
        raw: data.user,
      }
    : null;

  return {
    token,
    user,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidSessionShape(session: unknown): session is AuthSession {
  return (
    isRecord(session) &&
    typeof session.token === "string" &&
    (typeof session.expiresAt === "number" ||
      session.expiresAt === null)
  );
}

function canUseBrowserStorage() {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined"
  );
}

