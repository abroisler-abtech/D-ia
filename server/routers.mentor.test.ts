import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLMMock, listLLMModelsMock, recordMentorInteractionMock } = vi.hoisted(() => ({
  invokeLLMMock: vi.fn(),
  listLLMModelsMock: vi.fn(),
  recordMentorInteractionMock: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: invokeLLMMock,
  listLLMModels: listLLMModelsMock,
}));

vi.mock("./db", () => ({
  listMentorInteractions: vi.fn(),
  recordMentorInteraction: recordMentorInteractionMock,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const anonymousContext = {
  user: null,
  req: { protocol: "https", headers: {} },
  res: { clearCookie: vi.fn() },
} as unknown as TrpcContext;

describe("mentor.respond", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    listLLMModelsMock.mockResolvedValue({
      data: [{ id: "gpt-5-mini", object: "model", created: 0, owned_by: "openai" }],
    });
    invokeLLMMock.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: "Use int() antes de somar os valores." } }],
    });
  });

  it("envia código e erro como contexto e retorna a resposta da mentora", async () => {
    const caller = appRouter.createCaller(anonymousContext);

    const result = await caller.mentor.respond({
      messages: [{ role: "user", content: "Pode revisar minha função?" }],
      context: {
        code: "total = sum(input().split())",
        error: "TypeError",
        objective: "Somar valores recebidos",
      },
      mode: "assist",
    });

    expect(result.content).toContain("int()");
    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    const invokedMessages = invokeLLMMock.mock.calls[0]?.[0]?.messages;
    expect(invokedMessages[0].content).toContain("total = sum");
    expect(invokedMessages[0].content).toContain("TypeError");
    expect(recordMentorInteractionMock).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "assist", userId: undefined })
    );
  });

  it("separa a resposta da Déia das informações web no retorno final", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(`
      <a class="result__a" href="https://docs.python.org/3/">Python docs</a>
      <a class="result__snippet">Referência oficial.</a>
    `, { status: 200 })));
    const caller = appRouter.createCaller(anonymousContext);

    const result = await caller.mentor.respond({
      messages: [{ role: "user", content: "Como consulto a documentação?" }],
      context: { objective: "Aprender Python" },
      mode: "assist",
      webSearch: true,
      searchQuery: "documentação oficial Python",
    });

    expect(result.content).toContain("### Resposta da Déia");
    expect(result.content).toContain("### Informações obtidas na web");
    expect(result.content).toContain("https://docs.python.org/3/");
    expect(invokeLLMMock.mock.calls[0]?.[0]?.messages.at(-1)?.content).toContain("Python docs");
  });

  it("encaminha uma tentativa de exercício para avaliação estruturada", async () => {
    const caller = appRouter.createCaller(anonymousContext);

    const result = await caller.mentor.evaluatePractice({
      topic: "laços de repetição",
      challenge: "Conte os valores pares da lista fornecida.",
      attempt: "for numero in numeros:\n    print(numero)",
    });

    expect(result.content).toContain("int()");
    const invokedMessages = invokeLLMMock.mock.calls[0]?.[0]?.messages;
    expect(invokedMessages[0].content).toContain("Avaliação");
    expect(invokedMessages[1].content).toContain("print(numero)");
    expect(recordMentorInteractionMock).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "practice", userId: undefined })
    );
  });
});
