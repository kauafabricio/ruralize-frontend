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

export type LoginCredentials = {
  email: string;
  password: string;
};

const API_BASE_URL = "https://rural-backend.vercel.app";
const SESSION_STORAGE_KEY = "ruralize.session";
const AUTH_COOKIE_NAME = "ruralize_auth";

type JsonRecord = Record<string, unknown>;

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(readErrorMessage(data) || "Erro ao fazer login");
  }

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

export function getAuthorizationHeader(session: AuthSession | null) {
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

function createSessionFromLoginResponse(data: unknown): AuthSession {
  const token = findToken(data);

  if (!token) {
    throw new Error("Token de autenticação não retornado pelo servidor.");
  }

  const decodedToken = decodeJwtPayload(token);
  const userPayload = findUserPayload(data) ?? decodedToken;
  const user = userPayload ? normalizeUser(userPayload) : null;

  return {
    token,
    user,
    expiresAt: readExpiration(decodedToken),
  };
}

function findToken(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  const directToken = readString(data, [
    "token",
    "accessToken",
    "access_token",
    "jwt",
  ]);

  if (directToken) {
    return directToken;
  }

  for (const key of ["data", "session", "auth"]) {
    const nestedToken = findToken(data[key]);

    if (nestedToken) {
      return nestedToken;
    }
  }

  return null;
}

function findUserPayload(data: unknown): JsonRecord | null {
  if (!isRecord(data)) {
    return null;
  }

  for (const key of ["user", "usuario", "account", "profile"]) {
    if (isRecord(data[key])) {
      return data[key];
    }
  }

  for (const key of ["data", "session", "auth"]) {
    const nestedUser = findUserPayload(data[key]);

    if (nestedUser) {
      return nestedUser;
    }
  }

  return null;
}

function normalizeUser(payload: JsonRecord): AuthUser {
  return {
    id: readString(payload, ["id", "_id", "sub", "userId", "user_id"]),
    name: readString(payload, ["name", "nome", "fullName", "full_name"]),
    email: readString(payload, ["email"]),
    role: readString(payload, ["role", "perfil", "type"]),
    avatarUrl: readString(payload, [
      "avatar",
      "avatarUrl",
      "avatar_url",
      "photo",
      "photoUrl",
      "picture",
      "pictureUrl",
      "image",
      "imageUrl",
      "image_url",
      "foto",
      "imagem",
      "profileImage",
      "profile_image",
    ]),
    raw: payload,
  };
}

function decodeJwtPayload(token: string): JsonRecord | null {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload =
      normalizedPayload + "=".repeat((4 - (normalizedPayload.length % 4)) % 4);
    const decodedPayload = atob(paddedPayload);
    const parsedPayload = JSON.parse(decodedPayload) as unknown;

    return isRecord(parsedPayload) ? parsedPayload : null;
  } catch {
    return null;
  }
}

function readExpiration(payload: JsonRecord | null): number | null {
  const exp = payload?.exp;

  return typeof exp === "number" ? exp * 1000 : null;
}

function writeAuthCookie(session: AuthSession) {
  const maxAge = session.expiresAt
    ? Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
    : 60 * 60 * 24 * 7;

  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAge}; samesite=lax`;
}

function readErrorMessage(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  return readString(data, ["message", "detail", "error"]) ?? null;
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

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidSessionShape(session: unknown): session is AuthSession {
  return (
    isRecord(session) &&
    typeof session.token === "string" &&
    (typeof session.expiresAt === "number" || session.expiresAt === null)
  );
}

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
