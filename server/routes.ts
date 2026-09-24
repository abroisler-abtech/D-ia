import type { Express } from "express";

export function registerRoutes(app: Express) {
  const responder = async (req: any, res: any) => {
    try {
      console.log("Mensagem recebida no backend:", req.body);
      const userText = req.body?.prompt || req.body?.message || "";
      const texto = userText.toLowerCase().trim();

      // 1. Tratamento abrangente de saudações
      if (texto.includes("bom dia") || texto.includes("boa tarde") || texto.includes("boa noite") || texto.includes("ola") || texto.includes("oi")) {
        const msg = "Olá, André! Tudo bem? Como posso ajudar no seu projeto hoje?";
        return res.json({ text: msg, response: msg });
      }

      // 2. Validação da Chave
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const errApi = "A chave GEMINI_API_KEY não está configurada no Render.";
        return res.json({ text: errApi, response: errApi });
      }

      // 3. Chamada para o Gemini com formato AQ.
      console.log("Enviando para o Gemini...");
      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userText }] }]
          })
        }
      );

      const data = await apiRes.json();
      console.log("Retorno do Gemini:", JSON.stringify(data).substring(0, 150));

      if (data.error) {
        const errMsg = `Erro Google: ${data.error.message}`;
        return res.json({ text: errMsg, response: errMsg });
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return res.json({ text: reply, response: reply });
      }

      return res.json({ text: "Sem resposta da IA", response: "Sem resposta da IA" });
    } catch (err: any) {
      console.error("Erro no Servidor:", err);
      return res.json({ text: `Erro interno: ${err.message}`, response: `Erro interno: ${err.message}` });
    }
  };

  // Mapeia todas as rotas que o frontend pode tentar chamar
  app.post("/api/chat", responder);
  app.post("/api/mentor", responder);
  app.post("/api/generate", responder);
}
