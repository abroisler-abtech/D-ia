import sys
from ddgs import DDGS

def buscar_informacoes(objetivo: str) -> str:
    print(f"Pesquisando na web por: '{objetivo}'...\n")
    
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(objetivo, max_results=4):
            results.append(r)
            
    if not results:
        return "Nenhum resultado encontrado."

    saida = []
    for i, res in enumerate(results, 1):
        bloco = (
            f"[Resultado {i}] {res['title']}\n"
            f"Fonte: {res['href']}\n"
            f"Resumo: {res['body']}\n"
            f"{'-' * 40}"
        )
        saida.append(bloco)
        
    resultado_final = "\n\n".join(saida)
    print(resultado_final)
    return resultado_final

if __name__ == "__main__":
    tarefa = sys.argv[1] if len(sys.argv) > 1 else "Como criar uma lista em Python"
    buscar_informacoes(tarefa)
EOLcat <<'EOL' > agente_web.py
import sys
from ddgs import DDGS

def buscar_informacoes(objetivo: str) -> str:
    print(f"Pesquisando na web por: '{objetivo}'...\n")
    
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(objetivo, max_results=4):
            results.append(r)
            
    if not results:
        return "Nenhum resultado encontrado."

    saida = []
    for i, res in enumerate(results, 1):
        bloco = (
            f"[Resultado {i}] {res['title']}\n"
            f"Fonte: {res['href']}\n"
            f"Resumo: {res['body']}\n"
            f"{'-' * 40}"
        )
        saida.append(bloco)
        
    resultado_final = "\n\n".join(saida)
    print(resultado_final)
    return resultado_final

if __name__ == "__main__":
    tarefa = sys.argv[1] if len(sys.argv) > 1 else "Como criar uma lista em Python"
    buscar_informacoes(tarefa)
