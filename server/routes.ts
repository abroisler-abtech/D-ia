import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Na rota de recebimento de mensagem (POST /api/chat ou similar):
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const msgLower = message.toLowerCase().trim();

  // 1. Resposta para saudações simples
  if (msgLower === "bom dia" || msgLower === "olá" || msgLower === "oi") {
    return res.json({ response: "Bom dia, André! Como posso te ajudar hoje?" });
  }

  // 2. Chamada automática para o agente de busca Python
  try {
    const { stdout } = await execAsync(`python3 agente_web.py "${message}"`);
    return res.json({ response: stdout });
  } catch (error) {
    return res.json({ response: "Desculpe, tive um problema ao pesquisar na web." });
  }
});
