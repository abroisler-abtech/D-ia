import { afterEach, describe, expect, it, vi } from "vitest";
import { searchWeb } from "./webSearch";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("searchWeb", () => {
  it("extrai resultados públicos e normaliza links de redirecionamento", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(`
      <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fdocs.python.org%2F3%2F">Python docs &amp; tutorial</a>
      <a class="result__snippet">Documentação oficial &amp; tutorial.</a>
    `, { status: 200 })));

    await expect(searchWeb("listas Python")).resolves.toEqual([
      {
        title: "Python docs & tutorial",
        url: "https://docs.python.org/3/",
        snippet: "Documentação oficial & tutorial.",
      },
    ]);
  });

  it("falha de forma explícita quando o provedor responde com erro", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("indisponível", { status: 503 })));
    await expect(searchWeb("Python")).rejects.toThrow("Busca web indisponível (503)");
  });
});
