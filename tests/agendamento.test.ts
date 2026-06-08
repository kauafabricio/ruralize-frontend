import { describe, test, expect } from "@jest/globals";

function realizarInscricao(vagasDisponiveis: number) {
  return vagasDisponiveis > 0;
}

function cancelarInscricao(inscrito: boolean) {
  return inscrito;
}

function validarDataEvento(dataEvento: Date) {
  const hoje = new Date();

  return dataEvento > hoje;
}

describe("Agendamentos e Eventos", () => {
  test("deve permitir inscrição quando houver vagas disponíveis", () => {
    expect(realizarInscricao(10)).toBe(true);
  });

  test("deve permitir cancelar uma inscrição existente", () => {
    expect(cancelarInscricao(true)).toBe(true);
  });

  test("deve validar que o evento ocorre em uma data futura", () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);

    expect(validarDataEvento(amanha)).toBe(true);
  });
});