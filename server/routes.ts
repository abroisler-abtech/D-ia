import { Express } from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export function registerRoutes(app: Express) {
  // Rota genérica de resposta para o frontend
  const responder = async (req: any, res: any) => {
    const message = req.body?.message || req.body?.prompt || "";
    // Remove pontuações e converte para minúsculas
    const texto = message.toLowerCase().replace(/[^a-z0-9áéíóúâêôãõç ]/g, "").trim();

    // 1. Tratamento para saudações (com ou sem ponto)
    if (texto.includes("bom dia") || texto.includes("ola") || texto.includes("oi")) {
      return res.json({ text: "Bom dia, André! Como posso te ajudar hoje?" });
    }

    // 2. Processamento via script de busca Python
    try {
      const { stdout } = await execAsync(`python3 agente_web.py "${message}"`);
      return res.json({ text: stdout || "Busca concluída, mas sem retorno." });
    } catch (error) {
      return res.json({ text: `Recebi sua mensagem: "${message}". Como podemos avançar com esse projeto?` });
    }
  };

  // Mapeia todas as possíveis rotas que o frontend possa chamar
  app.post("/api/chat", responder);
  app.post("/api/mentor", responder);
  app.post("/api/generate", responder);
}
