import { describe, test, expect } from "@jest/globals";

function validarLogin(email: string, senha: string) {
  const emailValido = "teste@email.com";
  const senhaValida = "123456";

  return email === emailValido && senha === senhaValida;
}

describe("Login", () => {
  test("deve permitir login com credenciais válidas", () => {
    expect(
      validarLogin("teste@email.com", "123456")
    ).toBe(true);
  });

  test("deve bloquear login com senha incorreta", () => {
    expect(
      validarLogin("teste@email.com", "senhaErrada")
    ).toBe(false);
  });

  test("deve bloquear login com email incorreto", () => {
    expect(
      validarLogin("errado@email.com", "123456")
    ).toBe(false);
  });
});