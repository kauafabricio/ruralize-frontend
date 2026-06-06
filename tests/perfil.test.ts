import { describe, test, expect } from "@jest/globals";

function atualizarNome(nome: string) {
  return nome.trim().length > 0;
}

function alterarFotoPerfil(foto: string) {
  return foto.trim().length > 0;
}

function podeEditarCampo(campo: string) {
  const camposBloqueados = ["email", "matricula"];

  return !camposBloqueados.includes(campo);
}

describe("Perfil do Usuário", () => {
  test("deve permitir atualizar o nome do usuário", () => {
    expect(atualizarNome("Fernanda Antunes")).toBe(true);
  });

  test("deve permitir alterar a foto de perfil", () => {
    expect(alterarFotoPerfil("foto.jpg")).toBe(true);
  });

  test("não deve permitir editar email ou matrícula", () => {
    expect(podeEditarCampo("email")).toBe(false);
    expect(podeEditarCampo("matricula")).toBe(false);
  });
});