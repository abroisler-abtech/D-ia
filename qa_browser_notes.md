# Verificação no navegador

A página inicial do PyMentor carregou no navegador com os controles de contexto, ações rápidas, seleção de modo, chat e opção de entrada visíveis e acessíveis. A próxima verificação cobre o preenchimento do contexto, uma solicitação de revisão e a geração de um desafio.

O formulário de contexto aceitou objetivo, código e erro. A ação rápida **Revisar** inseriu a solicitação no chat e exibiu corretamente o estado visual de análise enquanto a resposta era processada.

A revisão retornou no chat com diagnóstico do `TypeError`, solução, explicação do funcionamento e próximos testes. O atalho **Exercício** também mudou para o modo de prática e iniciou a geração de um desafio com o objetivo atual como tema.

O desafio foi gerado com critérios de conclusão e dica inicial, sem antecipar a solução. O campo dedicado de tentativa aceitou uma implementação Python e habilitou a ação **Avaliar tentativa**.

A avaliação da tentativa foi exibida no chat com as seções **Avaliação**, **O que funcionou**, **O que ajustar**, **Próximo passo** e **Dica direcionada**. O retorno reconheceu os acertos específicos e sugeriu uma melhoria incremental, sem substituir a aprendizagem por uma nova solução completa.

O fluxo de **Depurar** também foi acionado no navegador: exibiu o estado de análise e devolveu uma orientação de diagnóstico que solicita código, traceback, comportamento esperado e entrada reprodutível antes de propor a correção.

## Executor Python

O painel **Executar Python** carregou no navegador com o indicador de execução local, entrada opcional, saída e limite de 8 segundos. Um programa com `input()` e o valor `Ana` foram aceitos pelo editor e pelo campo de entrada; a execução está pronta para ser acionada.

O teste manual foi concluído: o runtime carregou em aproximadamente 2,3 segundos, aceitou `Ana` como entrada, exibiu `Nome: Olá, Ana!` na saída e restaurou o botão para **Executar código**.

O executor também foi validado com um `SyntaxError`: o painel exibiu **Erro na execução** e o traceback completo, enquanto o código inválido permaneceu preservado no editor para correção.

O loop infinito foi interrompido após 8 segundos pelo worker, com a mensagem **A execução excedeu 8 segundos e foi interrompida para proteger a página**. O botão voltou ao estado normal e o editor permaneceu responsivo.

Durante a validação, a página foi recarregada pelo HMR e exigiu atualizar os índices dos controles. Depois disso, o script sem `input()` foi inserido corretamente no editor; a entrada opcional ficou vazia.

Também foi validado um script sem `input()`: `print(sum([2, 4, 6]))` retornou `12` no painel de saída e exibiu a duração da execução.

A screenshot mobile (390x844) confirmou que o painel de execução se reorganiza verticalmente, mantém os controles acessíveis e separa a saída sem overflow horizontal. A aplicação foi reaberta para testar entradas multilinha.

A entrada multilinha com `primeira`, uma linha vazia e `terceira` foi aceita pelo campo de input; o executor iniciou a execução mantendo as quebras de linha no valor informado.

A saída confirmou a normalização correta: `'primeira'`, `''` e `'terceira'` foram recebidos em ordem, incluindo a linha vazia.

A inspeção dos logs de rede não encontrou endpoint de execução Python: durante os testes, as requisições registradas foram apenas de autenticação/histórico. Isso confirma que o código executado permanece no worker do navegador.

Para verificar o carregamento único, o mesmo script `print(2 + 2)` foi executado novamente após o runtime já ter sido usado: retornou `4` em `26 ms`. O worker é reutilizado em execuções subsequentes, evitando novo carregamento do Pyodide.

A repetição controlada do mesmo `print(2 + 2)` retornou `4` em `19 ms`, confirmando o reaproveitamento do worker/runtime depois do primeiro carregamento.

Renomeação validada no navegador: o título aparece como `Déia — Aprenda programando em Python`, o cabeçalho mostra `Déia`, o indicador mostra `Déia ao vivo` e a mensagem inicial apresenta `Olá, eu sou a Déia`.

A interface atual mostra os botões `Baixar .py` e `Exportar conversa`, além do controle `Pesquisa na internet`. O download de código foi validado no Chrome e gerou `entender-e-melhorar-meu-codigo-python.py`.

A pesquisa web foi ativada na interface e a pergunta sobre a versão atual do Python foi enviada; o chat exibiu o estado `analisando` enquanto aguardava busca e resposta da Déia.

Pesquisa web validada no navegador: com o modo ativado, a Déia respondeu à pergunta sobre Python e exibiu uma seção `Fontes consultadas` com links para documentação e Python.org. O fluxo permaneceu dentro do chat e exibiu o estado de carregamento antes da resposta.

A exportação da conversa também foi validada: o Chrome criou `entender-e-melhorar-meu-codigo-python.md`; o histórico de downloads agora contém tanto o arquivo `.md` quanto o `.py`.

Exportação e pesquisa web validadas após a implementação. O workspace desktop exibiu `Baixar .py`, `Exportar conversa` e `Pesquisa na internet`; os downloads `.py` e `.md` foram confirmados no Chrome. A pesquisa ativada retornou resposta da Déia com seção `Fontes consultadas` e links públicos. A viewport mobile de 390x844 manteve os controles utilizáveis e a interface sem sobreposição. `pnpm check`, `pnpm test` (13 testes) e `pnpm build` concluíram com sucesso; o build apenas informa um aviso existente de chunk grande.

Após a atualização dos rótulos da pesquisa, a interface recarregou corretamente no navegador e manteve visíveis os controles de exportação e o botão `Ativar` da pesquisa web.

A pesquisa web foi ativada novamente e uma pergunta sobre listas Python foi enviada. O chat exibiu `analisando`; esta execução serve para validar a renderização final dos rótulos `Resposta da Déia` e `Informações obtidas na web`.

Validação final concluída: a resposta renderizada exibe `Resposta da Déia` separada de `Informações obtidas na web`, seguida das fontes consultadas e links públicos. O teste automatizado correspondente também passou.
