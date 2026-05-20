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

const SESSION_STORAGE_KEY = "ruralize.session";
const AUTH_COOKIE_NAME = "ruralize_auth";
const MOCK_SESSION_DURATION_MS = 1000 * 60 * 60 * 24;

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const email = credentials.email.trim() || "visitante@ufrpe.br";
  const name = readNameFromEmail(email) ?? "Visitante";

  return {
    token: "mock-token",
    user: {
      id: "mock-user",
      name,
      email,
      role: "student",
      raw: {
        name,
        email,
        course: "Agroecologia",
        registration: "202300000",
      },
    },
    expiresAt: Date.now() + MOCK_SESSION_DURATION_MS,
  };
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

function writeAuthCookie(session: AuthSession) {
  const maxAge = session.expiresAt
    ? Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
    : 60 * 60 * 24 * 7;

  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAge}; samesite=lax`;
}

function readNameFromEmail(email: string | undefined) {
  if (!email) {
    return null;
  }

  const [namePart] = email.split("@");

  if (!namePart) {
    return null;
  }

  const formatted = namePart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formatted || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
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
