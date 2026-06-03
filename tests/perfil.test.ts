import { describe, test, expect } from "@jest/globals";

function perfilValido(perfil: {
  name: string;
  email: string;
  points: number;
}) {
  return (
    perfil.name.length > 0 &&
    perfil.email.includes("@") &&
    perfil.points >= 0
  );
}

describe("Perfil", () => {
  test("deve validar perfil correto", () => {
    expect(
      perfilValido({
        name: "Maria Fernanda",
        email: "maria@email.com",
        points: 100,
      })
    ).toBe(true);
  });

  test("deve rejeitar email inválido", () => {
    expect(
      perfilValido({
        name: "Maria Fernanda",
        email: "email_invalido",
        points: 100,
      })
    ).toBe(false);
  });

  test("deve rejeitar pontos negativos", () => {
    expect(
      perfilValido({
        name: "Maria Fernanda",
        email: "maria@email.com",
        points: -1,
      })
    ).toBe(false);
  });
});