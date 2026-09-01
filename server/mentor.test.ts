import { describe, expect, it } from "vitest";
import {
  buildMentorMessages,
  buildPracticeEvaluationMessages,
  buildPracticeMessages,
} from "./mentor";

describe("mensagens do PyMentor", () => {
  it("preserva o contexto de código, erro e objetivo para a análise didática", () => {
    const messages = buildMentorMessages(
      [{ role: "user", content: "Por que o programa falha?" }],
      {
        objective: "Ler uma lista de números",
        code: "numeros = input().split()\nprint(sum(numeros))",
        error: "TypeError: unsupported operand type(s) for +",
      },
      "assist"
    );

    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe("system");
    expect(messages[0]?.content).toContain("Diagnóstico");
    expect(messages[0]?.content).toContain("sum(numeros)");
    expect(messages[0]?.content).toContain("TypeError");
    expect(messages[0]?.content).toContain("Ler uma lista de números");
  });

  it("instrui a criação de desafios sem revelar a solução imediatamente", () => {
    const messages = buildPracticeMessages({
      level: "iniciante",
      topic: "condicionais e listas",
    });

    expect(messages[0]?.content).toContain("Não entregue a solução inicialmente");
    expect(messages[1]?.content).toContain("condicionais e listas");
  });

  it("pede uma correção construtiva e estruturada para a tentativa de prática", () => {
    const messages = buildPracticeEvaluationMessages({
      topic: "laços de repetição",
      challenge: "Conte os números pares de uma lista.",
      attempt: "contador = 0\nfor numero in numeros:\n    contador += 1",
    });

    expect(messages[0]?.content).toContain("O que funcionou");
    expect(messages[0]?.content).toContain("não entregue uma solução completa");
    expect(messages[1]?.content).toContain("contador += 1");
  });
});
