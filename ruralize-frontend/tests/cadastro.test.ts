import { describe, test, expect } from "@jest/globals";

function validarCadastro(
  nome: string,
  email: string,
  senha: string
) {
  return (
    nome.trim().length > 0 &&
    email.includes("@") &&
    senha.length >= 6
  );
}

describe("Cadastro", () => {
  test("deve aceitar cadastro com dados válidos", () => {
    expect(
      validarCadastro(
        "Fernanda",
        "fernanda@email.com",
        "123456"
      )
    ).toBe(true);
  });

  test("deve rejeitar cadastro sem nome", () => {
    expect(
      validarCadastro(
        "",
        "fernanda@email.com",
        "123456"
      )
    ).toBe(false);
  });

  test("deve rejeitar senha com menos de 6 caracteres", () => {
    expect(
      validarCadastro(
        "Fernanda",
        "fernanda@email.com",
        "123"
      )
    ).toBe(false);
  });
});