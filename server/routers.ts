import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { listMentorInteractions, recordMentorInteraction } from "./db";
import { formatWebContext, formatWebSources, searchWeb } from "./webSearch";
import {
  buildMentorMessages,
  buildPracticeEvaluationMessages,
  buildPracticeMessages,
  type MentorChatMessage,
  type MentorContext,
} from "./mentor";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12_000),
});

const mentorContextSchema = z.object({
  code: z.string().max(30_000).optional(),
  error: z.string().max(12_000).optional(),
  objective: z.string().max(2_000).optional(),
});

let cachedModel: string | undefined;
let modelWasResolved = false;

async function resolveMentorModel() {
  if (modelWasResolved) return cachedModel;
  modelWasResolved = true;

  try {
    const { data } = await listLLMModels();
    const preferredModels = ["claude-sonnet-4-6", "gpt-5", "gpt-5-mini"];
    cachedModel = preferredModels.find(candidate => data.some(model => model.id === candidate));
  } catch (error) {
    console.warn("[PyMentor] Could not resolve a preferred model; using the platform default.", error);
  }

  return cachedModel;
}

function responseText(result: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = result.choices[0]?.message.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const text = content
      .filter(part => part.type === "text")
      .map(part => part.text)
      .join("\n")
      .trim();
    if (text) return text;
  }
  throw new Error("The model returned an empty response.");
}

async function askMentor(messages: Parameters<typeof invokeLLM>[0]["messages"]) {
  const model = await resolveMentorModel();
  const result = await invokeLLM({
    ...(model ? { model } : {}),
    messages,
    ...(model === "claude-sonnet-4-6"
      ? { thinking: { type: "enabled", budget_tokens: 1024 }, maxTokens: 2600 }
      : {}),
  });
  return responseText(result);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  mentor: router({
    respond: publicProcedure
      .input(
        z.object({
          messages: z.array(chatMessageSchema).min(1).max(18),
          context: mentorContextSchema.optional().default({}),
          mode: z.enum(["assist", "practice"]).default("assist"),
          webSearch: z.boolean().default(false),
          searchQuery: z.string().trim().max(240).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const messages = input.messages as MentorChatMessage[];
          const context = input.context as MentorContext;
          let webResults = [] as Awaited<ReturnType<typeof searchWeb>>;
          let webSearchWarning = "";

          if (input.webSearch) {
            const query = input.searchQuery || messages.at(-1)?.content || context.objective || "Python";
            try {
              webResults = await searchWeb(query);
              if (webResults.length === 0) webSearchWarning = "Não encontrei resultados públicos para esta busca; respondi usando o contexto disponível.";
            } catch (searchError) {
              console.warn("[Déia] Web search failed; continuing without it.", searchError);
              webSearchWarning = "A busca web ficou indisponível; respondi usando o contexto disponível. Tente novamente mais tarde.";
            }
          }

          const mentorMessages = buildMentorMessages(messages, context, input.mode);
          if (webResults.length > 0) {
            mentorMessages.push({ role: "system", content: formatWebContext(webResults) });
          }
          const content = await askMentor(mentorMessages);
          const responseLabel = input.webSearch ? `### Resposta da Déia\n\n${content}` : content;
          const decoratedContent = `${responseLabel}${formatWebSources(webResults)}${webSearchWarning ? `\n\n> ${webSearchWarning}` : ""}`;

          await recordMentorInteraction({
            userId: ctx.user?.id,
            kind: input.mode,
            prompt: messages.at(-1)?.content ?? "",
            response: decoratedContent,
            context: JSON.stringify({ ...context, webSearch: input.webSearch, searchQuery: input.searchQuery ?? null, sources: webResults }),
          });

          return { content: decoratedContent, sources: webResults };
        } catch (error) {
          console.error("[PyMentor] Mentor request failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível gerar a orientação agora. Tente novamente em alguns instantes.",
          });
        }
      }),
    createPractice: publicProcedure
      .input(
        z.object({
          level: z.enum(["iniciante", "intermediário", "avançado"]),
          topic: z.string().trim().min(2).max(200),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const content = await askMentor(buildPracticeMessages(input));
          await recordMentorInteraction({
            userId: ctx.user?.id,
            kind: "practice",
            prompt: `Desafio ${input.level}: ${input.topic}`,
            response: content,
            context: JSON.stringify(input),
          });
          return { content };
        } catch (error) {
          console.error("[PyMentor] Practice request failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível criar o desafio agora. Tente novamente em alguns instantes.",
          });
        }
      }),
    evaluatePractice: publicProcedure
      .input(
        z.object({
          topic: z.string().trim().min(2).max(200),
          challenge: z.string().trim().min(10).max(16_000),
          attempt: z.string().trim().min(1).max(30_000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const content = await askMentor(buildPracticeEvaluationMessages(input));
          await recordMentorInteraction({
            userId: ctx.user?.id,
            kind: "practice",
            prompt: `Avaliação de tentativa: ${input.topic}`,
            response: content,
            context: JSON.stringify({ challenge: input.challenge, attempt: input.attempt }),
          });
          return { content };
        } catch (error) {
          console.error("[PyMentor] Practice evaluation failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível avaliar a tentativa agora. Tente novamente em alguns instantes.",
          });
        }
      }),
    history: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(12).default(6) }))
      .query(({ ctx, input }) => {
        if (!ctx.user) return [];
        return listMentorInteractions(ctx.user.id, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
