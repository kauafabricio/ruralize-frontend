import {
  clearStoredSession,
  getAuthorizationHeader,
  getStoredSession,
  isSessionExpired,
} from "./auth";

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const session = getStoredSession();

  if (!session || isSessionExpired(session)) {
    clearStoredSession();
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const headers = new Headers(init.headers);
  const authorizationHeader = getAuthorizationHeader(session).Authorization;

  if (authorizationHeader) {
    headers.set("Authorization", authorizationHeader);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
