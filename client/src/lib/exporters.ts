export type ExportMessage = {
  role: "user" | "assistant";
  content: string;
};

export function safeFilename(value: string, fallback: string) {
  const normalized = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return normalized || fallback;
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function buildCodeExport(code: string) {
  return code.trim() ? `${code.trim()}\n` : "# Cole seu código Python aqui\n";
}

export function buildConversationExport(messages: ExportMessage[], objective: string) {
  const transcript = messages
    .map(message => `## ${message.role === "user" ? "Você" : "Déia"}\n\n${message.content}`)
    .join("\n\n---\n\n");
  const header = `# Conversa com Déia\n\nObjetivo: ${objective.trim() || "Python"}\n\n`;
  return `${header}${transcript}\n`;
}
