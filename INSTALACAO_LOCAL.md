# Déia — Instalação local

Este pacote contém a aplicação web da Déia, uma tutora de Python com chat didático, execução Python no navegador, exportação de arquivos e pesquisa web acionada pelo usuário.

## Requisitos

É necessário ter Node.js 22 ou superior, pnpm 10 ou superior e um banco MySQL ou TiDB acessível. O executor Python usa Pyodide/WebAssembly no navegador e não exige Python instalado na máquina para funcionar dentro da aplicação. Para trabalhar também pelo terminal, instale Python 3.11 ou superior separadamente.

## Instalação

Na pasta do projeto, execute:

```bash
pnpm install
cp .env.example .env
```

Abra `.env` e preencha os valores obrigatórios. Nunca publique esse arquivo nem o envie para repositórios.

Depois, gere e aplique as migrações do banco:

```bash
pnpm db:push
```

Inicie o ambiente de desenvolvimento:

```bash
pnpm dev
```

Abra a URL local exibida pelo servidor. Para validar a instalação, execute:

```bash
pnpm check
pnpm test
pnpm build
```

## Variáveis de ambiente

As variáveis mínimas para o chat com IA são `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`. Para persistência e login, configure também `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL` e `VITE_OAUTH_PORTAL_URL`. O arquivo `.env.example` lista a configuração completa sem conter credenciais reais.

## O que funciona localmente

O chat, a revisão didática, o modo de prática, a persistência, os testes e o build funcionam localmente quando as variáveis e o banco estão configurados. O botão **Baixar .py** e o botão **Exportar conversa** geram arquivos diretamente no navegador. O botão **Executar Python** mantém o código no cliente e usa WebAssembly; ele não executa código arbitrário no servidor.

A pesquisa web usa resultados públicos, apresenta as fontes na conversa e deve ser ativada pelo usuário. Ela pode depender de conectividade de saída e de disponibilidade do provedor de pesquisa.

## Limitações importantes

A versão local não inclui um instalador executável de um clique. Ela é uma aplicação Node/React/Express e é instalada com `pnpm`. Também não inclui automaticamente credenciais de IA, banco, OAuth ou armazenamento. Essas credenciais precisam ser fornecidas pelo operador em `.env` ou por um gerenciador de segredos.

O runtime Python no navegador não oferece `pip`, arquivos locais, processos persistentes ou todas as bibliotecas nativas. Para esses casos, seria necessário um sandbox remoto separado, com autenticação, limites de CPU/memória, isolamento de rede e política própria de segurança.

## Instalação para publicação

Para publicar pela plataforma Manus, use o checkpoint fornecido na conversa e o botão **Publish** da interface de gerenciamento. Para executar fora da plataforma, revise primeiro `server/_core/env.ts`, configure um banco compatível, forneça um provedor LLM compatível com o helper existente e defina corretamente o fluxo OAuth. Não inclua `.env`, chaves, sessões ou dados do banco no ZIP.

## Estrutura relevante

| Caminho | Função |
| --- | --- |
| `client/src/pages/Home.tsx` | Interface principal da Déia |
| `client/src/lib/pythonRunner.ts` | Execução Python local em WebAssembly |
| `client/src/lib/exporters.ts` | Exportação de `.py` e `.md` |
| `server/webSearch.ts` | Pesquisa web, timeout e fontes |
| `server/routers.ts` | Rotas tRPC do chat e da pesquisa |
| `GUIA_DE_USO.md` | Guia funcional para o usuário |
| `todo.md` | Histórico de implementação e QA |
