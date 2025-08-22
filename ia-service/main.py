from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from openai import OpenAI
import httpx # Importe httpx

load_dotenv()

app = FastAPI()

# Configuração de CORS para permitir requisições do frontend e do backend Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "https://matheusnlima.github.io",
        "https://concessionaria-nunes.onrender.com"  # Exemplo de URL pública do seu FRONTEND no Render
        # Para produção, você adicionaria a URL pública real do seu Frontend Render aqui.
        # As URLs abaixo para localhost:3001 e localhost:8000 podem ser removidas em produção
        "http://localhost:3001", # Permite que o backend chame o front localmente (embora não seja comum)
        "http://localhost:8000"  # Permite ao próprio AI Service ou a um cliente local testar
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração da API da OpenAI
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    print("ERRO CRÍTICO: OPENAI_API_KEY não foi carregada no Python! Verifique o .env do AI Service ou as vars de ambiente do Render.")
    # Se isso ocorrer em produção no Render, a inicialização falhará e o serviço não subirá.
    # raise ValueError("OPENAI_API_KEY não definida!") 
else:
    print("AI Service: OPENAI_API_KEY carregada com sucesso (parcialmente exibida):", OPENAI_KEY[:5] + "...")

# ========================== INICIALIZAÇÃO DO CLIENTE OPENAI (Robustez contra Proxies) ==========================
# Crie o cliente OpenAI globalmente para ser usado por todas as rotas
openai_client = None
try:
    print("AI Service: Verificando e temporariamente limpando variáveis de ambiente de proxy antes de inicializar o cliente OpenAI...")
    # Limpa as variáveis de ambiente de proxy para a sessão ATUAL (importante para evitar o erro 'proxies')
    temp_env_http_proxy = os.environ.pop('HTTP_PROXY', None)
    temp_env_https_proxy = os.environ.pop('HTTPS_PROXY', None)
    temp_env_no_proxy = os.environ.pop('NO_PROXY', None) # As vezes NO_PROXY é importante para destinos internos

    openai_client = OpenAI(
        api_key=OPENAI_KEY,
    )
    
    print("AI Service: Cliente OpenAI inicializado com sucesso.")

except Exception as e:
    print(f"ERRO CRÍTICO ao inicializar o cliente OpenAI: {e}. O serviço de IA pode não funcionar.")
    # Levanta uma exceção para que o FastAPI saiba que houve uma falha de startup.
    # Isso fará o container do Render falhar no deploy.
    raise RuntimeError(f"Falha na configuração da IA na inicialização: {e}") 

finally:
    # Restaura as variáveis de ambiente DEPOIS da inicialização, para não afetar outros componentes,
    # caso eles dependam dessas variáveis de proxy.
    if temp_env_http_proxy is not None and 'HTTP_PROXY' not in os.environ:
        os.environ['HTTP_PROXY'] = temp_env_http_proxy
    if temp_env_https_proxy is not None and 'HTTPS_PROXY' not in os.environ:
        os.environ['HTTPS_PROXY'] = temp_env_https_proxy
    if temp_env_no_proxy is not None and 'NO_PROXY' not in os.environ:
        os.environ['NO_PROXY'] = temp_env_no_proxy

# ========================== CARREGAMENTO DOS CARROS NO STARTUP ==========================
ALL_CARS_DATA = []
BACKEND_NODEJS_URL = os.getenv("BACKEND_NODEJS_URL") # Nova variável de ambiente

@app.on_event("startup") # Registra uma função assíncrona que será executada ao iniciar o app FastAPI
async def load_all_cars_on_startup():
    global ALL_CARS_DATA
    if not BACKEND_NODEJS_URL:
        print("AVISO CRÍTICO: BACKEND_NODEJS_URL NÃO ESTÁ DEFINIDA para o AI Service! O chat de carro pode falhar por falta de contexto.")
        # Se for um cenário de deploy local/dev sem backend, pode fornecer um fallback aqui
        # Ex: ALL_CARS_DATA = [{"id": 1, "nome": "Carro Fallback", "marca": "Dev", ...}]
        return
    
    try:
        print(f"AI Service: Buscando lista completa de carros do Backend Node.js em {BACKEND_NODEJS_URL}/api/carros")
        async with httpx.AsyncClient() as client: # Usar AsyncClient do httpx para requisições assíncronas
            response = await client.get(f"{BACKEND_NODEJS_URL}/api/carros")
            response.raise_for_status() # Lança exceção para status de erro (4xx/5xx)
            ALL_CARS_DATA = response.json()
        print(f"AI Service: Carregados {len(ALL_CARS_DATA)} carros na inicialização para o contexto do chat.")
    except httpx.HTTPStatusError as e:
        print(f"ERRO: Falha HTTP ao carregar carros do Backend Node.js (status {e.response.status_code}). Detalhes: {e}")
        # Falha de startup para garantir que o serviço não inicie sem dados cruciais
        raise RuntimeError(f"Falha no startup: Backend Node.js retornou erro HTTP {e.response.status_code} para /api/carros.")
    except httpx.RequestError as e:
        print(f"ERRO: Falha de conexão ao carregar carros do Backend Node.js: {e}. URL: {BACKEND_NODEJS_URL}")
        raise RuntimeError(f"Falha no startup: Não foi possível conectar ao Backend Node.js em {BACKEND_NODEJS_URL}.")
    except Exception as e:
        print(f"ERRO: Erro inesperado ao carregar carros na inicialização do AI Service: {e}")
        raise RuntimeError(f"Falha no startup: Erro inesperado ao carregar carros: {e}")


class CarData(BaseModel):
    id: int
    nome: str
    marca: str
    ano: int
    preco: str
    descricao: str
    fotosUrls: list[str] = []

# ========================== CHAT REQUEST (SEM O CONTEXTO COMPLETO DOS CARROS) ==========================
class ChatRequest(BaseModel):
    carro_id: int
    user_message: str
    # O contexto completo dos carros NÃO é mais enviado aqui, pois o AI Service já o tem.

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
        
        response = openai_client.chat.completions.create( # Usa a instância openai_client global
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
        print(f"AI Service: Error in /generate_description: {e}")
        # Loga o erro, mas re-lança uma HTTPException para o Node.js capturar
        raise HTTPException(status_code=500, detail=f"Erro ao gerar descrição: {str(e)}")

@app.post("/chat")
async def chat_about_car(chat_request: ChatRequest):
    try:
        global ALL_CARS_DATA # Para acessar a lista de carros carregada no startup
        
        carro_alvo = next(
            (carro for carro in ALL_CARS_DATA if carro["id"] == chat_request.carro_id),
            None
        )
        
        if not carro_alvo:
            # Retorna o erro 404 claro se o carro não for encontrado na lista
            raise HTTPException(status_code=404, detail=f"Carro com ID {chat_request.carro_id} não encontrado no contexto de IA.")
        
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
        
        response = openai_client.chat.completions.create( # Usa a instância openai_client global
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
        print(f"AI Service: Error in /chat: {e}")
        # Loga o erro, mas re-lança uma HTTPException para o Node.js capturar
        raise HTTPException(status_code=500, detail=f"Erro no chat: {str(e)}")

# Bloco principal de execução, para permitir que 'uvicorn main:app' funcione
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    # Para testes locais, você pode ativar a função de startup aqui,
    # mas o uvicorn com app.on_event("startup") geralmente a chama automaticamente.
    # asyncio.run(load_all_cars_on_startup()) # Apenas para testar manualmente o startup function
    uvicorn.run(app, host="0.0.0.0", port=port)