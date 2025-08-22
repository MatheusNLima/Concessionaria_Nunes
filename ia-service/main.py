# ai-service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Importe as classes OpenAI e httpx
from openai import OpenAI
import httpx # Novo import!

load_dotenv()

app = FastAPI()

# Configuração de CORS (manter como está)

# Configuração da API da OpenAI
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    print("ERRO: OPENAI_API_KEY não foi carregada no Python!")
    # Considere raise ValueError("OPENAI_API_KEY não definida!") para falhar mais cedo se for crítico
else:
    print("OPENAI_API_KEY carregada com sucesso no Python (parcialmente exibida):", OPENAI_KEY[:5] + "...")

# ========================== MUDANÇA CRÍTICA AQUI ==========================
# Crie um cliente HTTPX customizado que EXPLICITAMENTE não usa proxies
# Este é um contorno comum para o erro "unexpected keyword argument 'proxies'"
try:
    # custom_http_client = httpx.Client(proxies=None) # Uma abordagem, se httpx aceitar proxies=None diretamente

    # Uma abordagem mais robusta para httpx 0.20+ é definir explicitamente como não ter proxies
    # ou, se o erro é que ele recebe o argumento mas não sabe o que fazer, podemos tentar
    # não passar *nenhum* argumento para httpx.Client e gerenciar as variáveis de ambiente.

    # Alternativa mais limpa para lidar com proxy via ambiente, sem passar para o cliente.
    # Assegura que httpx não pegue de variáveis de ambiente do sistema.
    print("Verificando e temporariamente limpando variáveis de ambiente de proxy...")
    temp_env_http_proxy = os.environ.pop('HTTP_PROXY', None)
    temp_env_https_proxy = os.environ.pop('HTTPS_PROXY', None)
    temp_env_no_proxy = os.environ.pop('NO_PROXY', None) # As vezes NO_PROXY é importante

    # Inicializa o cliente OpenAI usando a chave.
    # Agora ele não deve inferir proxies de variáveis de ambiente limpadas.
    # IMPORTANTE: Use 'httpx.map.AsyncHTTPTransport' para usar proxies que você configurar,
    # ou se não usar nenhum, ele não adicionará 'proxies=...' ao httpx.Client()
    # Mas para resolver o "unexpected keyword argument 'proxies'", a chave é NÃO TER O PROXY EM AMBIENTE.
    # Então, o `os.environ.pop()` é a ação mais direta.
    
    openai_client = OpenAI(
        api_key=OPENAI_KEY,
        # Para httpx v0.20+, proxies são passados via `Transport`,
        # não diretamente em `httpx.Client()` na maioria dos casos simples.
        # O erro `unexpected keyword argument 'proxies'` para `Client.__init__()`
        # indica que algo está passando `proxies=` onde não deveria, o que vem do ambiente.
        # Por isso, limpar o ambiente antes da inicialização é a solução.
    )
    
    print("OpenAI client initialized successfully, checking proxy env vars effect.")

except Exception as e:
    print(f"ERRO CRÍTICO ao inicializar o cliente OpenAI: {e}")
    # RESTORE env vars if they were there (important if other parts of the app use them)
    if temp_env_http_proxy is not None:
        os.environ['HTTP_PROXY'] = temp_env_http_proxy
    if temp_env_https_proxy is not None:
        os.environ['HTTPS_PROXY'] = temp_env_https_proxy
    if temp_env_no_proxy is not None:
        os.environ['NO_PROXY'] = temp_env_no_proxy

    raise HTTPException(status_code=500, detail=f"Falha na configuração da IA: {str(e)}") # Levanta um erro fatal se o cliente IA não iniciar

finally:
    # Restore environment variables AFTER client initialization
    # (if the problem wasn't caught by the except block)
    if temp_env_http_proxy is not None and 'HTTP_PROXY' not in os.environ:
        os.environ['HTTP_PROXY'] = temp_env_http_proxy
    if temp_env_https_proxy is not None and 'HTTPS_PROXY' not in os.environ:
        os.environ['HTTPS_PROXY'] = temp_env_https_proxy
    if temp_env_no_proxy is not None and 'NO_PROXY' not in os.environ:
        os.environ['NO_PROXY'] = temp_env_no_proxy


# REMOVIDA: openai.api_key = os.getenv("OPENAI_API_KEY") # Agora instanciamos explicitamente

# As classes CarData e ChatRequest ficam as mesmas
# As rotas FastAPI (@app.get, @app.post) também.

# Certifique-se de que todas as chamadas de API agora usam `openai_client`
# Originalmente: response = openai.chat.completions.create(...)
# Mude para: response = openai_client.chat.completions.create(...)
# Isso já estava nas versões que te passei para main.py, mas confira novamente!

class CarData(BaseModel):
    id: int
    nome: str
    marca: str
    ano: int
    preco: str
    descricao: str
    fotosUrls: list[str] = []

class ChatRequest(BaseModel):
    carro_id: int
    user_message: str
    carros_contexto: list[dict]

@app.get("/")
async def root():
    return {"message": "API Python da Concessionária Nunes está funcionando!"}

@app.post("/generate_description")
async def generate_description(car_data: CarData):
    try:
        prompt = f"""
        Você é um especialista em vendas de automóveis. 
        Gere uma descrição atraente e técnica para o carro abaixo.
        
        Dados do carro:
        - Nome: {car_data.nome}
        - Marca: {car_data.marca}
        - Ano: {car_data.ano}
        - Preço: {car_data.preco}
        - Descrição atual: {car_data.descricao}
        
        A descrição deve ser em português, técnica mas acessível, 
        destacando benefícios e características únicas do veículo.
        """
        
        response = openai_client.chat.completions.create( # Usar a instância criada
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7
        )
        
        return {
            "carro_id": car_data.id,
            "descricao_gerada": response.choices[0].message.content
        }
        
    except Exception as e:
        print(f"Error in generate_description: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar descrição: {str(e)}")

@app.post("/chat")
async def chat_about_car(chat_request: ChatRequest):
    try:
        carro_alvo = next(
            (carro for carro in chat_request.carros_contexto if carro["id"] == chat_request.carro_id), 
            None
        )
        
        if not carro_alvo:
            raise HTTPException(status_code=404, detail="Carro não encontrado")
        
        prompt = f"""
        Você é um vendedor especializado da Concessionária Nunes.
        Responda à pergunta do cliente sobre o carro específico abaixo.
        
        Dados do carro:
        - Nome: {carro_alvo['nome']}
        - Marca: {carro_alvo['marca']}
        - Ano: {carro_alvo['ano']}
        - Preço: {carro_alvo['preco']}
        - Descrição: {carro_alvo['descricao']}
        
        Pergunta do cliente: {chat_request.user_message}
        
        Seja prestativo, preciso e profissional. 
        Mantenha o foco apenas neste carro específico.
        """
        
        response = openai_client.chat.completions.create( # Usar a instância criada
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=250,
            temperature=0.3
        )
        
        return {
            "resposta": response.choices[0].message.content,
            "carro_id": chat_request.carro_id
        }
        
    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=f"Erro no chat: {str(e)}")

if __name__ == "__main__":
    app = app
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)