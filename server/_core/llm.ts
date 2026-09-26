import { GoogleGenerativeAI } from "@google/generative-ai";

interface InvokeParams {
  messages: Array<{ role: string; content: string }>;
}

interface InvokeResult {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  try {
    const { messages } = params;
    const lastMessage = messages[messages.length - 1];
    const userPrompt = typeof lastMessage?.content === 'string'
      ? lastMessage.content
      : "Olá";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
  model: "gemini-3.5-flash",
  systemInstruction: "Você é a Déia, uma Engenheira de Software Sênior e Especialista em Inteligência Artificial. Seu foco principal é Python, frameworks de dados como Streamlit, e desenvolvimento de agentes autônomos. Seu objetivo é atuar como mentora e assistente de programação do André. Forneça explicações diretas, código limpo, otimizado e com foco nas melhores práticas de mercado. Sugira melhorias arquiteturais e evite respostas vagas."
});

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const textContent = response.text() || "Olá! Como posso ajudar com o seu código Python?";

    return {
      choices: [
        {
          message: {
            content: textContent,
          },
        },
      ],
    };
  } catch (error: any) {
    console.error("Erro detalhado no invokeLLM:", error);
    return {
      choices: [
        {
          message: {
            content: `Erro na API do Google: ${error.message || "Erro desconhecido"}`,
          },
        },
      ],
    };
  }
}

export async function listLLMModels() {
  return [{ id: "gemini-1.5-flash-latest", name: "gemini-3.5-flash" }];
}

