import { API_BASE_URL } from "@/app/services/api/client";

export function resolveBackendImageUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  const trimmed = String(url).trim();
  if (!trimmed) {
    return undefined;
  }

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed);
  if (hasProtocol) {
    return trimmed;
  }

  try {
    return new URL(trimmed, `${API_BASE_URL.replace(/\/$/, "")}/`).toString();
  } catch {
    return trimmed;
  }
}
