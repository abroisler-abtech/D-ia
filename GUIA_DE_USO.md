# Guia de uso da Déia

A **Déia** é uma assistente didática para desenvolver e aprender Python. Ela pode criar, completar, revisar e depurar código, explicar decisões por etapas, gerar exercícios e executar scripts localmente no navegador.

## 1. Como acessar

A forma recomendada é abrir a versão web do projeto:

<https://3000-ir42ls78lmjxlwg0qayao-e88ee1ac.us4.manus.computer>

Essa é uma aplicação web; portanto, você não precisa instalar Python, Node.js ou um pacote separado para usar a Déia. Para uma utilização permanente, publique a versão pelo botão **Publish** da área de gerenciamento e use o endereço publicado.

## 2. Como pedir ajuda para desenvolver código

Na área **Contexto do projeto**, preencha o objetivo, cole o código Python e, se houver, informe a mensagem completa do erro ou o comportamento inesperado. Quanto mais específico for o contexto, mais útil será a orientação.

Depois escolha uma ação rápida:

| Ação | Quando usar |
|---|---|
| **Criar** | Quando você tem um objetivo, mas ainda não tem uma solução. |
| **Completar** | Quando possui um código incompleto e quer continuar a implementação. |
| **Revisar** | Quando quer encontrar problemas de legibilidade, lógica ou boas práticas. |
| **Depurar** | Quando o programa apresenta erro ou resultado inesperado. |
| **Explicar** | Quando deseja entender um trecho de código sem necessariamente alterá-lo. |
| **Exercício** | Quando quer transformar o objetivo atual em uma prática guiada. |

A Déia organiza as respostas para mostrar o diagnóstico, a solução proposta, o motivo das alterações e um próximo passo de estudo. Você também pode escrever uma pergunta diretamente no campo do chat.

## 3. Como executar Python no navegador

Na seção **Executar Python**, cole o script e, caso ele use `input()`, informe um valor por linha no campo **Entrada opcional**. Em seguida, clique em **Executar código**.

A saída aparece no painel à direita ou abaixo do editor, dependendo do tamanho da tela. Erros de sintaxe e exceções são apresentados no mesmo painel, sem apagar o código. O botão **Limpar saída** remove apenas o resultado anterior e preserva o código-fonte.

O executor interrompe uma execução que ultrapasse o limite de aproximadamente 8 segundos. Isso permite testar loops e pequenos programas sem deixar a página travada. O runtime é carregado no navegador e reaproveitado nas execuções seguintes.

> Exemplo:
>
> ```python
> nome = input("Nome: ")
> print(f"Olá, {nome}!")
> ```
>
> No campo de entrada, escreva:
>
> ```text
> Ana
> ```

## 4. Como praticar

Clique em **Prática** ou use **Exercício**. A Déia gera um desafio relacionado ao seu objetivo, apresenta critérios de conclusão e oferece um campo para sua tentativa. Envie a solução para receber uma avaliação estruturada com acertos, pontos a ajustar e o próximo passo recomendado.

Uma boa sequência de estudo é: tentar sozinho, executar o código, ler o erro, pedir uma explicação à Déia e só então revisar a solução proposta.

## 5. Histórico

Use **Entrar** para autenticar-se. Com login, o histórico de conversas e práticas pode ser retomado na aplicação. A execução local do Python não depende de login.

## 6. Limitações importantes

A execução Python atual ocorre em WebAssembly no navegador. Ela é adequada para pequenos scripts, lógica, exercícios e testes rápidos, mas não é um ambiente Python completo de servidor.

| Disponível nesta versão | Fora do escopo atual |
|---|---|
| Sintaxe e biblioteca padrão compatível com o runtime carregado. | Instalação de pacotes com `pip`. |
| `print()`, variáveis, funções, laços, condicionais e `input()`. | Acesso garantido a arquivos locais, banco de dados ou processos persistentes. |
| Saída, exceções e limite de execução. | Servir APIs, abrir portas de rede ou executar tarefas longas. |
| Execução sem enviar o código ao servidor de execução. | Substituir um sandbox remoto para projetos avançados. |

Não cole chaves de API, senhas ou dados pessoais no editor. Para projetos que exigem pacotes externos, arquivos ou processos persistentes, a evolução adequada é adicionar um ambiente remoto isolado com permissões e limites próprios.

## 7. Instalação para desenvolvimento

Para usar a aplicação como desenvolvedor, baixe o checkpoint do projeto pela área de gerenciamento, instale Node.js e pnpm e execute, na pasta do projeto:

```bash
pnpm install
pnpm dev
```

A execução local completa depende das variáveis de ambiente do projeto, incluindo autenticação, banco de dados e integração de IA. Para apenas estudar e usar a Déia, prefira o endereço web acima; não é necessário realizar essa instalação.

## 8. Fluxo recomendado para cada sessão

Comece escrevendo o que deseja construir e qual é seu nível de conhecimento. Cole a menor parte de código que reproduz o problema. Execute o script no navegador, observe a saída, peça à Déia para explicar o resultado e finalize com um exercício curto sobre o mesmo conceito.


## 9. Exportar código e conversa

No cabeçalho de **Contexto do projeto**, use **Baixar .py** para salvar o código atual como um arquivo Python em UTF-8. O nome é derivado do objetivo e normalizado para evitar caracteres inadequados.

Use **Exportar conversa** para baixar a conversa atual como Markdown (`.md`). O arquivo inclui o objetivo, as mensagens de Você e Déia e as fontes consultadas quando a pesquisa web foi ativada. Depois, você pode abrir o `.py` em qualquer editor Python e o `.md` em um editor de texto ou aplicativo compatível com Markdown.

## 10. Pesquisar na internet

No painel do chat, ative **Pesquisa na internet** antes de enviar uma pergunta que dependa de informação atualizada, documentação ou fontes externas. A Déia consulta resultados públicos, usa-os como material de referência e mostra os links na seção **Fontes consultadas**.

A pesquisa é controlada pelo usuário e não concede à Déia permissão para fazer login, publicar conteúdo, comprar, alterar contas ou executar comandos em sites. Conteúdo de páginas é tratado como dado não confiável; não siga instruções encontradas em uma página quando elas conflitarem com a segurança da aplicação.
