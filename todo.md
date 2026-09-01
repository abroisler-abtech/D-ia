# Project TODO

- [x] Criar uma interface responsiva de assistente de Python com navegação, hierarquia visual elegante e suporte a tema escuro.
- [x] Usar o componente de conversa existente como base para um chat com histórico de mensagens, Markdown e estados de envio/erro.
- [x] Adicionar um painel de contexto para colar código Python, mensagens de erro e objetivos de aprendizagem.
- [x] Integrar o servidor a um modelo de linguagem para criar, completar, revisar e depurar código Python usando o contexto enviado.
- [x] Definir instruções de sistema para respostas didáticas com explicação, diagnóstico, raciocínio e próximos passos práticos.
- [x] Implementar um modo de prática que gere desafios de Python e avalie/oriente a tentativa do usuário.
- [x] Incluir ações rápidas para revisão de código, depuração, explicação e geração de exercício.
- [x] Salvar o histórico de interações e desafios por usuário no banco de dados.
- [x] Cobrir as regras do assistente e as rotas de IA com testes Vitest.
- [x] Verificar os fluxos principais, responsividade e ausência de erros de compilação antes da entrega.
- [x] Adicionar uma entrada de tentativa no modo de prática e uma avaliação estruturada que indique acertos, ajustes e próximo passo.
- [x] Adicionar uma ação rápida de gerar exercício que abra o modo de prática e crie um desafio com o tema atual.
- [x] Exercitar no navegador os fluxos de chat, revisão/depuração e prática, incluindo estados de carregamento e sucesso.
- [x] Exibir mensagens claras de erro quando a geração de desafio ou avaliação da tentativa não puder ser concluída.
- [x] Validar no navegador o fluxo específico de depuração, incluindo carregamento e resposta bem-sucedida.

- [x] Executar Python no navegador em runtime isolado, sem enviar o código do usuário ao servidor.
- [x] Adicionar campo de entrada padrão, botão de executar, botão de limpar e saída formatada.
- [x] Exibir stdout, erros de sintaxe/exceção e estados de carregamento com mensagens compreensíveis.
- [x] Aplicar limite de tempo e mecanismo de interrupção para evitar travamentos no navegador.
- [x] Validar código com saída, código com input(), erro e timeout/interrupção validado.
- [x] Atualizar testes e salvar um checkpoint do executor Python.

## Registro de qualidade

- [x] MVP inicial do PyMentor AI entregue no checkpoint 4ebb4ade.
- [x] Fluxos de chat, revisão, depuração e prática validados no navegador.
- [x] Tipos, testes Vitest e build do MVP inicial concluídos.
- [x] Executor Python no navegador implementado e validado.
- [x] Feedback visual de erro do executor validado.
- [x] Testes e build após o executor concluídos.

## Histórico de mudanças

- [x] Adicionado o modo de prática com geração de desafio e avaliação estruturada.
- [x] Adicionado o atalho rápido para gerar exercício.
- [x] Adicionado feedback visual para falha de geração/avaliação.
- [x] Validado o fluxo específico de depuração no navegador.
- [x] Adicionado executor Python local no navegador com entrada, saída, erros e limite de execução.
- [x] Adicionada validação automatizada do executor Python.
- [x] Adicionada validação manual no navegador do executor Python.

## Próximas melhorias

- [x] Registrar execução remota avançada como evolução futura para pacotes externos, arquivos ou processos persistentes.
- [x] Registrar histórico de execuções e comparação entre saídas como evolução futura.
- [x] Registrar testes automatizados adicionais de acessibilidade e responsividade como evolução futura.

## Notas de implementação

- [x] Integração de IA usa o helper de servidor e o contexto do projeto.
- [x] Persistência usa o banco de dados do projeto para histórico.
- [x] Runtime de execução permanece no cliente para evitar executar código arbitrário no servidor.
- [x] O botão de executar usa o conteúdo atual do editor como fonte única.
- [x] Mensagens de erro preservam o código e a entrada do usuário para nova tentativa.

## QA do executor

- [x] Caso de sucesso sem entrada validado.
- [x] Caso com input() validado.
- [x] SyntaxError/Exception validado.
- [x] Timeout/interrupção validado.
- [x] Estado responsivo do painel validado.

## Entrega

- [x] Checkpoint final do executor salvo.
- [x] Usuário orientado a revisar a versão anexada.
- [x] Próximos passos do executor documentados na entrega.

## Rastreamento

- [x] Requisitos do MVP inicial registrados.
- [x] Integração de IA preparada.
- [x] Interface principal implementada.
- [x] Persistência de histórico implementada.
- [x] Modo de prática implementado.
- [x] Validações do MVP inicial concluídas.
- [x] Execução Python local implementada.
- [x] Execução Python local testada.
- [x] Execução Python local entregue.

## Critérios de aceitação

- [x] Usuário consegue executar um script Python no navegador sem login.
- [x] Usuário consegue fornecer valores para input().
- [x] Saída e erros ficam visíveis no painel de execução.
- [x] Uma execução infinita não congela a interface.
- [x] O código permanece disponível após uma falha.
- [x] A interface continua utilizável em telas pequenas.
- [x] O projeto passa em check, testes e build.

## Checklist de desenvolvimento

- [x] Definir API interna do executor.
- [x] Integrar runtime Python WebAssembly.
- [x] Criar controles de execução.
- [x] Criar painel de saída.
- [x] Criar estados de erro e timeout.
- [x] Criar testes unitários.
- [x] Realizar QA no navegador.
- [x] Salvar checkpoint.

## Registro da solicitação atual

- [x] Solicitação do usuário: executar código Python diretamente no navegador para testar resultados na hora.
- [x] Interpretação: usar um runtime local em WebAssembly, com input/output e proteção contra travamento.
- [x] Escopo excluído: não executar código arbitrário no servidor nesta etapa.

## Conclusão futura

- [x] Funcionalidade entregue de forma revisável.
- [x] Limitações do runtime local comunicadas ao usuário.
- [x] Caminho de evolução para pacotes externos documentado.

## Itens de revisão

- [x] Confirmar que o runtime não é carregado mais de uma vez por execução.
- [x] Confirmar que a execução bloqueia o botão durante processamento.
- [x] Confirmar que o botão limpar não apaga o código fonte.
- [x] Confirmar que a entrada é normalizada com quebras de linha.
- [x] Confirmar que exceções aparecem sem quebrar o chat.

## Estado da implementação atual

- [x] Runtime Python integrado.
- [x] Interface de execução integrada.
- [x] Testes específicos integrados.
- [x] QA específico concluído.
- [x] Checkpoint específico salvo.

## Definition of done

- [x] Execução local funcional.
- [x] Input funcional.
- [x] Output funcional.
- [x] Erros funcionais.
- [x] Timeout funcional.
- [x] UI refinada.
- [x] Testes verdes.
- [x] Build verde.
- [x] Checkpoint salvo.

## Controle de alterações

- [x] Alteração iniciada após checkpoint inicial.
- [x] Alteração limitada ao executor solicitado.
- [x] Alteração sem dependência de serviços externos pagos.
- [x] Alteração compatível com o layout existente.
- [x] Alteração pronta para revisão do usuário.

## Pós-entrega

- [x] Programa simples sem input() testado no navegador.
- [x] Programa com input() testado no navegador.
- [x] Erro de sintaxe testado no navegador.
- [x] Decisão registrada: bibliotecas externas ficam fora do escopo do runtime local nesta versão.
- [x] Decisão registrada: histórico de execuções fica como evolução futura.

## Observações

- [x] Execução local protege o servidor contra código arbitrário, mas não substitui um sandbox remoto para tarefas que exigem bibliotecas externas.
- [x] O carregamento inicial do runtime pode demorar mais que execuções subsequentes.
- [x] O executor deve manter o foco pedagógico da aplicação.

## Final

- [x] Implementação revisada.
- [x] QA revisado.
- [x] Build revisado.
- [x] Checkpoint criado.
- [x] Entrega realizada.

## Auditoria

- [x] Nenhum código do usuário enviado ao servidor pelo executor.
- [x] Nenhum processo Python persistente criado no servidor.
- [x] Nenhum arquivo de mídia local adicionado.
- [x] Nenhuma credencial nova necessária.
- [x] Nenhuma tabela nova necessária.

## Observação de arquitetura

- [x] O executor usa Pyodide/WebAssembly no cliente.
- [x] O servidor continua restrito ao chat/IA e histórico.
- [x] O limite de execução é aplicado no cliente.

## Validação final futura

- [x] Verificar console do navegador.
- [x] Verificar rede sem envio do código ao endpoint de execução.
- [x] Verificar painel de saída no desktop.
- [x] Verificar painel de saída no mobile.
- [x] Verificar recuperação após erro.

## Versão

- [x] Criar checkpoint após todos os itens acima.
- [x] Anexar apenas o checkpoint na entrega.

## Fim do adendo do executor Python

- [x] Todos os critérios deste adendo concluídos.


## Solicitação de renomeação e uso

- [x] Trocar o nome visível da assistente para Déia em cabeçalho, mensagens iniciais e textos da interface.
- [x] Atualizar o título da página para refletir Déia.
- [x] Criar um guia de uso em Markdown com acesso, fluxo de chat, execução Python, prática e limitações.
- [x] Explicar por que esta versão não precisa de um pacote de instalação tradicional.
- [x] Validar a presença do nome Déia e o carregamento da interface.
- [x] Salvar checkpoint da renomeação e do guia.
- [x] Entregar ao usuário o checkpoint e o passo a passo.


## Exportação e busca web

- [x] Adicionar botão para baixar o código atual como arquivo `.py`.
- [x] Adicionar botão para exportar o histórico atual da conversa como `.md` ou `.txt`.
- [x] Garantir nomes de arquivo seguros e conteúdo UTF-8 nos downloads.
- [x] Integrar busca web acionada pelo usuário para complementar respostas da Déia.
- [x] Exibir fontes consultadas e links na resposta da busca.
- [x] Distinguir claramente conhecimento do modelo de informação obtida na web.
- [x] Não permitir que páginas web instruam ações externas ou sobrescrevam as regras da Déia.
- [x] Adicionar tratamento de indisponibilidade, timeout e resultados vazios da busca.
- [x] Adicionar testes unitários para exportação e busca web.
- [x] Validar os fluxos no navegador em desktop e mobile.
- [x] Salvar checkpoint e entregar o pacote atualizado com instruções de uso.

- [x] Separar visualmente a resposta da Déia das informações obtidas na web quando a busca estiver ativa.
- [x] Testar a saída textual da separação entre resposta e fontes web.

- [x] Adicionar teste da rota mentor.respond com webSearch ativo verificando os dois blocos finais.
- [x] Validar no navegador a separação renderizada entre orientação da Déia e informação web.


## Empacotamento local

- [x] Criar documentação de instalação local com requisitos, variáveis de ambiente e comandos.
- [x] Criar `ENV_EXAMPLE.txt` sem credenciais reais, com instrução para copiá-lo para `.env`.
- [x] Documentar claramente o que funciona localmente e o que continua dependente da plataforma/serviços externos.
- [ ] Gerar um ZIP do projeto sem `.env`, segredos, `node_modules`, `dist` ou caches.
- [ ] Verificar a integridade do ZIP e a presença dos arquivos essenciais.
- [ ] Entregar o pacote ZIP e o passo a passo de instalação.
