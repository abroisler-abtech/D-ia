import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Braces,
  Bug,
  CheckCircle2,
  ChevronRight,
  Code2,
  GraduationCap,
  History,
  Lightbulb,
  Loader2,
  LogIn,
  Play,
  Sparkles,
  Wand2,
  Terminal,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Clock3,
  Download,
  FileText,
  Globe2,
} from "lucide-react";
import { isPythonTimeout, runPython } from "@/lib/pythonRunner";
import { buildCodeExport, buildConversationExport, downloadTextFile, safeFilename } from "@/lib/exporters";
import { type ReactNode, useMemo, useState } from "react";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: ConversationMessage = {
  role: "assistant",
  content: "## Olá, eu sou a Déia\n\nTraga um trecho de código, um erro ou um objetivo. Eu vou ajudar você a **construir**, **entender** e **melhorar** sua solução em Python.",
};

const starterCode = `def calcular_media(numeros):
    total = 0
    for numero in numeros:
        total += numero
    return total / len(numeros)

notas = [7.5, 8.0, 9.0]
print(calcular_media(notas))`;

type WorkspaceMode = "assist" | "practice";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const [messages, setMessages] = useState<ConversationMessage[]>([welcomeMessage]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [objective, setObjective] = useState("Entender e melhorar meu código Python");
  const [mode, setMode] = useState<WorkspaceMode>("assist");
  const [practiceTopic, setPracticeTopic] = useState("listas e condicionais");
  const [practiceLevel, setPracticeLevel] = useState<"iniciante" | "intermediário" | "avançado">("iniciante");
  const [challenge, setChallenge] = useState("");
  const [attempt, setAttempt] = useState("");
  const [runInput, setRunInput] = useState("");
  const [runOutput, setRunOutput] = useState("");
  const [runError, setRunError] = useState("");
  const [runDuration, setRunDuration] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const historyQuery = trpc.mentor.history.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  const responseMutation = trpc.mentor.respond.useMutation({
    onSuccess: result => {
      setMessages(current => [...current, { role: "assistant", content: result.content }]);
      void utils.mentor.history.invalidate();
    },
    onError: () => {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: "Não consegui gerar a orientação agora. Revise o contexto e tente novamente em alguns instantes.",
        },
      ]);
    },
  });

  const practiceMutation = trpc.mentor.createPractice.useMutation({
    onSuccess: result => {
      setMode("practice");
      setChallenge(result.content);
      setAttempt("");
      setMessages(current => [...current, { role: "assistant", content: result.content }]);
      void utils.mentor.history.invalidate();
    },
    onError: () => {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: "### Não foi possível criar o desafio agora\n\nTente novamente em alguns instantes. Você também pode ajustar o tema para algo mais específico, como `listas`, `funções` ou `arquivos`.",
        },
      ]);
    },
  });

  const evaluationMutation = trpc.mentor.evaluatePractice.useMutation({
    onSuccess: result => {
      setMessages(current => [...current, { role: "assistant", content: result.content }]);
      void utils.mentor.history.invalidate();
    },
    onError: () => {
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: "### Não foi possível avaliar sua tentativa agora\n\nSeu código continua no campo de resposta. Tente novamente em alguns instantes ou peça uma dica no chat enquanto isso.",
        },
      ]);
    },
  });

  const lineCount = useMemo(() => Math.max(8, code.split("\n").length + 1), [code]);
  const isBusy = responseMutation.isPending || practiceMutation.isPending || evaluationMutation.isPending;

  function sendMessage(content: string) {
    if (isBusy) return;
    const outgoing = [...messages, { role: "user" as const, content }];
    setMessages(outgoing);
    responseMutation.mutate({
      messages: outgoing.slice(-18),
      context: {
        ...(code.trim() ? { code: code.trim() } : {}),
        ...(error.trim() ? { error: error.trim() } : {}),
        ...(objective.trim() ? { objective: objective.trim() } : {}),
      },
      mode,
      webSearch: webSearchEnabled,
      ...(webSearchEnabled ? { searchQuery: content } : {}),
    });
  }

  function useStarterCode() {
    setCode(starterCode);
    setError("");
    setObjective("Revisar uma função que calcula a média de notas");
  }

  function runAction(action: "create" | "complete" | "review" | "debug" | "explain") {
    const prompts = {
      create: "Crie uma solução Python para o objetivo informado, explicando a estrutura escolhida.",
      complete: "Complete o código que enviei. Mostre apenas as alterações necessárias e explique cada uma.",
      review: "Revise o código como uma mentora de Python: encontre problemas, sugira melhorias e apresente uma versão mais clara.",
      debug: "Depure o código usando o erro enviado. Identifique a causa provável e proponha a correção com explicação.",
      explain: "Explique o código enviado linha por linha, destacando os conceitos de Python que preciso entender.",
    } as const;
    sendMessage(prompts[action]);
  }

  function generatePractice() {
    if (practiceTopic.trim().length < 2 || isBusy) return;
    practiceMutation.mutate({ level: practiceLevel, topic: practiceTopic.trim() });
  }

  function evaluatePractice() {
    if (!challenge || !attempt.trim() || isBusy) return;
    evaluationMutation.mutate({
      topic: practiceTopic.trim() || "Python",
      challenge,
      attempt: attempt.trim(),
    });
  }

  async function executePython() {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setRunOutput("");
    setRunError("");
    setRunDuration(null);
    try {
      const result = await runPython(code, runInput);
      setRunOutput(result.stdout);
      setRunError(result.stderr);
      setRunDuration(result.durationMs);
    } catch (executionError) {
      setRunError(isPythonTimeout(executionError) ? "A execução excedeu 8 segundos e foi interrompida para proteger a página." : executionError instanceof Error ? executionError.message : "Não foi possível executar o código Python.");
    } finally {
      setIsRunning(false);
    }
  }

  function clearExecution() {
    setRunInput("");
    setRunOutput("");
    setRunError("");
    setRunDuration(null);
  }

  function exportCode() {
    downloadTextFile(`${safeFilename(objective, "deia-python")}.py`, buildCodeExport(code), "text/x-python");
  }

  function exportConversation() {
    downloadTextFile(`${safeFilename(objective, "deia-conversa")}.md`, buildConversationExport(messages, objective), "text/markdown");
  }

  const recentHistory = historyQuery.data ?? [];

  return (
    <div className="app-surface min-h-screen">
      <header className="border-b border-white/[0.07] bg-[#0b1020]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1540px] items-center justify-between px-5 lg:px-9">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-teal-500 text-[15px] font-extrabold text-slate-950 shadow-[0_8px_24px_rgba(45,212,191,0.22)]">P/</div>
              <div>
                <p className="text-[15px] font-extrabold tracking-tight text-white">Déia</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/65">AI studio</p>
              </div>
            </div>
            <div className="hidden items-center gap-1 md:flex">
              <button className="rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-white">Área de trabalho</button>
              <button onClick={() => setMode("practice")} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-white">Prática</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="hidden gap-1.5 border-cyan-200/10 bg-cyan-300/[0.07] px-2.5 py-1 text-[10px] font-bold text-cyan-100 sm:flex">
              <span className="size-1.5 rounded-full bg-teal-300" /> Assistente didática
            </Badge>
            {isAuthenticated ? (
              <Button variant="ghost" onClick={() => void logout()} className="gap-2 text-xs font-bold text-slate-300 hover:bg-white/[0.07] hover:text-white">
                <span className="hidden max-w-28 truncate sm:inline">{user?.name ?? "Minha conta"}</span>
                Sair
              </Button>
            ) : (
              <Button onClick={() => startLogin()} className="h-9 gap-2 bg-cyan-300 px-3 text-xs font-extrabold text-slate-950 hover:bg-cyan-200">
                <LogIn className="size-3.5" /> Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="grid-fade mx-auto max-w-[1540px] px-5 py-7 lg:px-9 lg:py-9">
        <section className="mb-7 flex flex-col gap-5 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl gentle-enter">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200/65">
              <GraduationCap className="size-3.5" /> Python, explicado com clareza
            </div>
            <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Desenvolva melhor.<br /><span className="text-cyan-200">Entenda cada decisão.</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Um ambiente focado para criar, revisar e depurar código Python com explicações que transformam cada resposta em aprendizado.</p>
          </div>

          <div className="flex w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] p-1.5 lg:w-auto">
            <button onClick={() => setMode("assist")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${mode === "assist" ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/10" : "text-slate-400 hover:text-white"}`}>
              <Code2 className="size-3.5" /> Desenvolver
            </button>
            <button onClick={() => setMode("practice")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${mode === "practice" ? "bg-violet-300 text-slate-950 shadow-lg shadow-violet-400/10" : "text-slate-400 hover:text-white"}`}>
              <BookOpen className="size-3.5" /> Praticar
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(420px,.94fr)]">
          <section className="space-y-5 gentle-enter">
            <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#11192b]/90 shadow-2xl shadow-slate-950/20">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-300/[0.1] text-cyan-200"><Braces className="size-4" /></div>
                  <div>
                    <p className="text-xs font-extrabold text-white">Contexto do projeto</p>
                    <p className="text-[11px] text-slate-500">A IA considera este material ao responder</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={useStarterCode} className="flex items-center gap-1.5 rounded-lg border border-white/[0.09] px-2.5 py-1.5 text-[11px] font-bold text-slate-300 transition hover:border-cyan-200/25 hover:text-cyan-100">
                    <Sparkles className="size-3" /> Carregar exemplo
                  </button>
                  <button onClick={exportCode} className="flex items-center gap-1.5 rounded-lg border border-cyan-200/15 bg-cyan-200/[0.04] px-2.5 py-1.5 text-[11px] font-bold text-cyan-100 transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.08]">
                    <Download className="size-3" /> Baixar .py
                  </button>
                  <button onClick={exportConversation} disabled={messages.length === 0} className="flex items-center gap-1.5 rounded-lg border border-white/[0.09] px-2.5 py-1.5 text-[11px] font-bold text-slate-300 transition hover:border-cyan-200/25 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40">
                    <FileText className="size-3" /> Exportar conversa
                  </button>
                </div>
              </div>

              <div className="grid border-b border-white/[0.08] md:grid-cols-[1fr_1fr]">
                <label className="border-b border-white/[0.08] p-4 md:border-b-0 md:border-r">
                  <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Objetivo</span>
                  <input value={objective} onChange={event => setObjective(event.target.value)} placeholder="Ex.: criar uma API com Flask" className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" />
                </label>
                <label className="p-4">
                  <span className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500"><Bug className="size-3" /> Erro ou comportamento</span>
                  <input value={error} onChange={event => setError(event.target.value)} placeholder="Cole aqui a mensagem de erro" className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600" />
                </label>
              </div>

              <div className="relative bg-[#0b1120]">
                <div className="absolute bottom-0 left-0 top-0 w-11 select-none border-r border-white/[0.05] bg-[#0e1626] pt-4 text-right font-mono text-[11px] leading-6 text-slate-600">
                  {Array.from({ length: lineCount }, (_, index) => <div className="pr-3" key={index}>{index + 1}</div>)}
                </div>
                <Textarea value={code} onChange={event => setCode(event.target.value)} placeholder="# Cole seu código Python aqui..." spellCheck={false} className="code-area min-h-[315px] resize-y border-0 bg-transparent pl-[3.75rem] pr-5 pt-4 font-mono text-[13px] leading-6 text-slate-200 shadow-none outline-none placeholder:text-slate-600 focus-visible:ring-0" />
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.08] bg-white/[0.018] px-4 py-3">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">Ações rápidas</span>
                <QuickAction disabled={isBusy} icon={<Wand2 className="size-3.5" />} label="Criar" onClick={() => runAction("create")} />
                <QuickAction disabled={isBusy} icon={<ChevronRight className="size-3.5" />} label="Completar" onClick={() => runAction("complete")} />
                <QuickAction disabled={isBusy} icon={<CheckCircle2 className="size-3.5" />} label="Revisar" onClick={() => runAction("review")} />
                <QuickAction disabled={isBusy} icon={<Bug className="size-3.5" />} label="Depurar" onClick={() => runAction("debug")} />
                <QuickAction disabled={isBusy} icon={<Lightbulb className="size-3.5" />} label="Explicar" onClick={() => runAction("explain")} />
                <QuickAction disabled={isBusy} icon={<BookOpen className="size-3.5" />} label="Exercício" onClick={() => { setMode("practice"); practiceMutation.mutate({ level: practiceLevel, topic: objective.trim() || practiceTopic.trim() || "fundamentos de Python" }); }} />
              </div>
            </div>

            {mode === "practice" && (
              <section className="rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-300/[0.1] to-[#141a31]/80 p-5 gentle-enter">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-violet-200"><BookOpen className="size-4" /><span className="text-xs font-extrabold uppercase tracking-[0.12em]">Modo de prática</span></div>
                    <h2 className="text-lg font-extrabold tracking-tight text-white">Aprenda resolvendo, não copiando.</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-400">Gere um desafio e peça uma dica de cada vez enquanto constrói sua resposta.</p>
                  </div>
                  <Badge className="border-violet-200/15 bg-violet-200/[0.08] text-[10px] text-violet-100">orientação gradual</Badge>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input value={practiceTopic} onChange={event => setPracticeTopic(event.target.value)} className="h-10 rounded-xl border border-white/[0.1] bg-[#0c1222]/70 px-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-violet-200/35" placeholder="Tema do desafio" />
                  <Button onClick={generatePractice} disabled={isBusy} className="h-10 gap-2 bg-violet-300 px-4 text-xs font-extrabold text-slate-950 hover:bg-violet-200">
                    {practiceMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Gerar desafio
                  </Button>
                </div>
                <div className="mt-3 flex gap-2">
                  {(["iniciante", "intermediário", "avançado"] as const).map(level => <button key={level} onClick={() => setPracticeLevel(level)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold capitalize transition ${practiceLevel === level ? "bg-violet-200/15 text-violet-100" : "text-slate-500 hover:text-slate-300"}`}>{level}</button>)}
                </div>
                {challenge && (
                  <div className="mt-4 rounded-xl border border-violet-100/10 bg-[#0b1020]/65 p-3.5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-[11px] font-extrabold text-violet-100">Sua tentativa</p>
                      <span className="text-[10px] font-medium text-slate-500">Receba orientação sem pular etapas</span>
                    </div>
                    <Textarea value={attempt} onChange={event => setAttempt(event.target.value)} placeholder="# Cole aqui a sua solução para receber uma avaliação guiada..." spellCheck={false} className="min-h-28 resize-y border-violet-100/10 bg-[#090e1b] font-mono text-xs leading-5 text-slate-200 placeholder:text-slate-600 focus-visible:ring-violet-300/50" />
                    <div className="mt-3 flex justify-end">
                      <Button onClick={evaluatePractice} disabled={!attempt.trim() || isBusy} variant="outline" className="h-9 gap-2 border-violet-200/20 bg-violet-200/[0.07] text-xs font-extrabold text-violet-100 hover:bg-violet-200/[0.14] hover:text-white">
                        {evaluationMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />} Avaliar tentativa
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            )}

            <PythonRunnerPanel
              code={code}
              runInput={runInput}
              setRunInput={setRunInput}
              runOutput={runOutput}
              runError={runError}
              runDuration={runDuration}
              isRunning={isRunning}
              onRun={executePython}
              onClear={clearExecution}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <ProgressCard label="Seu foco" value="Python" detail="Lógica e boas práticas" icon={<Code2 className="size-4" />} />
              <ProgressCard label="Método" value="Construir" detail="Receber explicações" icon={<Lightbulb className="size-4" />} />
              <ProgressCard label="Próximo passo" value="Praticar" detail="Um desafio por vez" icon={<GraduationCap className="size-4" />} />
            </div>
          </section>

          <aside className="min-w-0 gentle-enter">
            <div className="mb-4 flex items-end justify-between px-1">
              <div>
                <div className="mb-1 flex items-center gap-2"><span className="size-2 rounded-full bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,.9)]" /><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cyan-100">Déia ao vivo</p></div>
                <p className="text-xs text-slate-500">Código, explicação e próxima decisão</p>
              </div>
              {isBusy && <span className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-200"><Loader2 className="size-3 animate-spin" /> analisando</span>}
            </div>
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <Globe2 className={`size-3.5 shrink-0 ${webSearchEnabled ? "text-cyan-200" : "text-slate-600"}`} />
                <div className="min-w-0"><p className="text-[11px] font-extrabold text-slate-300">Pesquisa na internet</p><p className="truncate text-[10px] text-slate-600">A Déia consulta fontes públicas e mostra os links usados.</p></div>
              </div>
              <button type="button" onClick={() => setWebSearchEnabled(value => !value)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold transition ${webSearchEnabled ? "bg-cyan-300 text-slate-950" : "border border-white/[0.1] text-slate-400 hover:text-white"}`} aria-pressed={webSearchEnabled}>{webSearchEnabled ? "Ativada" : "Ativar"}</button>
            </div>
            <AIChatBox messages={messages} onSendMessage={sendMessage} isLoading={isBusy} height="min(68vh, 736px)" placeholder={mode === "practice" ? "Mostre sua tentativa ou peça a próxima dica..." : "Pergunte sobre seu código Python..."} emptyStateMessage="Traga um desafio de Python" suggestedPrompts={["Explique listas em Python", "Como depuro este erro?", "Crie um exercício para mim"]} className="overflow-hidden border-white/[0.1] bg-[#11192b]/95 shadow-2xl shadow-slate-950/25" />

            <section className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center gap-2"><History className="size-3.5 text-slate-500" /><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-500">Histórico de estudo</p></div>
              {isAuthenticated && recentHistory.length > 0 ? (
                <div className="space-y-2">
                  {recentHistory.map(item => <div key={item.id} className="flex items-start gap-2.5 rounded-xl bg-white/[0.035] px-3 py-2.5"><span className={`mt-1.5 size-1.5 rounded-full ${item.kind === "practice" ? "bg-violet-300" : "bg-cyan-300"}`} /><p className="line-clamp-1 text-[11px] font-medium text-slate-400">{item.prompt}</p></div>)}
                </div>
              ) : (
                <p className="text-[11px] leading-5 text-slate-500">{isAuthenticated ? "Suas interações aparecerão aqui." : "Entre para guardar seus estudos e retomar suas conversas."}</p>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function QuickAction({ icon, label, onClick, disabled }: { icon: ReactNode; label: string; onClick: () => void; disabled: boolean }) {
  return <button disabled={disabled} onClick={onClick} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-[11px] font-bold text-slate-400 transition hover:border-cyan-200/25 hover:bg-cyan-200/[0.07] hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40">{icon}{label}</button>;
}

function PythonRunnerPanel({
  code,
  runInput,
  setRunInput,
  runOutput,
  runError,
  runDuration,
  isRunning,
  onRun,
  onClear,
}: {
  code: string;
  runInput: string;
  setRunInput: (value: string) => void;
  runOutput: string;
  runError: string;
  runDuration: number | null;
  isRunning: boolean;
  onRun: () => void;
  onClear: () => void;
}) {
  const hasResult = Boolean(runOutput || runError || runDuration !== null);
  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200/10 bg-gradient-to-br from-emerald-200/[0.08] to-[#11192b]/90 shadow-xl shadow-slate-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-300/[0.1] text-emerald-200"><Terminal className="size-4" /></div>
          <div>
            <p className="text-xs font-extrabold text-white">Executar Python</p>
            <p className="text-[11px] text-slate-500">Teste o código localmente no navegador</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-200/75"><ShieldCheck className="size-3.5" /> código não sai do navegador</div>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_.9fr]">
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500"><Terminal className="size-3" /> Entrada opcional</label>
          <Textarea value={runInput} onChange={event => setRunInput(event.target.value)} placeholder="Um valor por linha para cada input()" spellCheck={false} className="min-h-24 resize-y border-white/[0.1] bg-[#0b1120]/80 font-mono text-xs leading-5 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-300/40" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={onRun} disabled={!code.trim() || isRunning} className="h-9 gap-2 bg-emerald-300 px-3.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-200">
              {isRunning ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} {isRunning ? "Executando..." : "Executar código"}
            </Button>
            <Button onClick={onClear} disabled={!hasResult && !runInput} variant="outline" className="h-9 gap-2 border-white/[0.1] bg-transparent text-xs font-bold text-slate-400 hover:bg-white/[0.06] hover:text-white"><RotateCcw className="size-3.5" /> Limpar saída</Button>
            <span className="flex items-center gap-1 text-[10px] text-slate-600"><Clock3 className="size-3" /> limite de 8s</span>
          </div>
        </div>
        <div className="min-h-36 rounded-xl border border-white/[0.08] bg-[#090e1b]/80 p-3">
          <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Saída</p>{runDuration !== null && <span className="text-[10px] font-mono text-slate-600">{runDuration} ms</span>}</div>
          {!hasResult ? <p className="text-xs leading-5 text-slate-600">A saída do seu programa aparecerá aqui.</p> : (
            <pre className={`max-h-44 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 ${runError ? "text-rose-200" : "text-emerald-100"}`}>{runError ? <><span className="mb-1 flex items-center gap-1.5 font-sans text-[10px] font-extrabold uppercase tracking-[0.12em] text-rose-300"><AlertTriangle className="size-3" /> Erro na execução</span>{runError}{runOutput ? `\\n${runOutput}` : ""}</> : runOutput || "(sem saída)"}</pre>
          )}
        </div>
      </div>
    </section>
  );
}

function ProgressCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5"><div className="mb-3 flex size-7 items-center justify-center rounded-lg bg-cyan-300/[0.08] text-cyan-200">{icon}</div><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-slate-600">{label}</p><p className="mt-1 text-sm font-extrabold text-white">{value}</p><p className="mt-0.5 text-[10px] text-slate-500">{detail}</p></div>;
}
