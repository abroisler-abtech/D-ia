const fs = require('fs');
let content = fs.readFileSync('server/_core/llm.ts', 'utf8');
// Substitui o retorno do invokeLLM para mapear o formato do Gemini para 'choices'
// Vamos garantir que a resposta devolve o objeto no formato esperado pela aplicação.
console.log("Ficheiro pronto a ajustar se necessário.");
