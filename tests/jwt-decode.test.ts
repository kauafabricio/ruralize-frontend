import { describe, test, expect } from "@jest/globals";

// Simulação da função decodeJWT que está em auth.ts
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Simulação da função readString que está em auth.ts
function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    // Também aceitar números (e.g., IDs numéricos)
    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

describe("Decodificação de JWT", () => {
  // JWT de exemplo com payload: { sub: "user-123", name: "Test User", email: "user@test.com" }
  const testJWT = 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiJUZXN0IFVzZXIiLCJlbWFpbCI6InVzZXJAdGVzdC5jb20ifQ." +
    "ZqfL_1D_Jv0XZj8VmZzZj1ZqfL_1D_Jv0XZj8VmZzZj";

  test("deve decodificar JWT válido", () => {
    const decoded = decodeJWT(testJWT);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe("user-123");
    expect(decoded?.name).toBe("Test User");
    expect(decoded?.email).toBe("user@test.com");
  });

  test("deve retornar null para JWT inválido", () => {
    const decoded = decodeJWT("token.inválido");
    expect(decoded).toBeNull();
  });

  test("deve extrair user ID com chave 'sub'", () => {
    const decoded = decodeJWT(testJWT);
    expect(decoded).not.toBeNull();
    if (decoded) {
      const userId = readString(decoded, ["sub", "id", "user_id"]);
      expect(userId).toBe("user-123");
    }
  });

  test("deve aceitar ID numérico", () => {
    const record = { id: 123, name: "Test" };
    const userId = readString(record, ["id"]);
    expect(userId).toBe("123");
  });

  test("deve procurar múltiplas chaves na ordem", () => {
    const record = { user_id: "abc-456", name: "Test" };
    const userId = readString(record, ["id", "sub", "user_id"]);
    expect(userId).toBe("abc-456");
  });

  test("deve retornar undefined se nenhuma chave existe", () => {
    const record = { name: "Test" };
    const userId = readString(record, ["id", "sub", "user_id"]);
    expect(userId).toBeUndefined();
  });
});

describe("Extração de User do JWT", () => {
  test("deve extrair múltiplos campos do JWT", () => {
    // JWT com payload: { sub: "123", name: "Maria", email: "maria@test.com", role: "student" }
    const testJWT = 
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJzdWIiOiIxMjMiLCJuYW1lIjoiTWFyaWEiLCJlbWFpbCI6Im1hcmlhQHRlc3QuY29tIiwicm9sZSI6InN0dWRlbnQifQ." +
      "ZqfL_1D_Jv0XZj8VmZzZj1ZqfL_1D_Jv0XZj8VmZzZj";

    const decoded = decodeJWT(testJWT);
    expect(decoded).not.toBeNull();
    
    if (decoded) {
      const user = {
        id: readString(decoded, ["sub", "id", "user_id"]),
        name: readString(decoded, ["name", "username"]),
        email: readString(decoded, ["email", "mail"]),
        role: readString(decoded, ["role", "roles"]),
      };

      expect(user.id).toBe("123");
      expect(user.name).toBe("Maria");
      expect(user.email).toBe("maria@test.com");
      expect(user.role).toBe("student");
    }
  });
});
