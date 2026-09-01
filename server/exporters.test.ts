import { describe, expect, it } from "vitest";
import { buildCodeExport, buildConversationExport, safeFilename } from "../client/src/lib/exporters";
import { formatWebContext, formatWebSources } from "./webSearch";

describe("exportações da Déia", () => {
  it("cria nomes seguros e preserva acentos no conteúdo", () => {
    expect(safeFilename("Criar média de notas!", "fallback")).toBe("criar-media-de-notas");
    expect(buildCodeExport("print('olá')")).toBe("print('olá')\n");
  });

  it("formata a conversa como Markdown com papéis claros", () => {
    const markdown = buildConversationExport(
      [
        { role: "user", content: "Explique listas" },
        { role: "assistant", content: "Listas armazenam itens em ordem." },
      ],
      "Listas em Python"
    );
    expect(markdown).toContain("# Conversa com Déia");
    expect(markdown).toContain("## Você");
    expect(markdown).toContain("## Déia");
  });
});

describe("fontes de pesquisa web", () => {
  const result = { title: "Python Docs", url: "https://docs.python.org/3/", snippet: "Documentação oficial" };

  it("adiciona resultados como referência e preserva a URL", () => {
    expect(formatWebContext([result])).toContain("material de referência não confiável");
    expect(formatWebSources([result])).toContain("### Informações obtidas na web");
    expect(formatWebSources([result])).toContain("[Python Docs](<https://docs.python.org/3/>)");
  });

  it("não cria links ativos para protocolos não web", () => {
    expect(formatWebSources([{ ...result, url: "javascript:alert(1)" }])).not.toContain("javascript:");
  });
});
