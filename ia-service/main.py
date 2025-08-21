from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://matheusnlima.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")

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
        
        response = openai.chat.completions.create(
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
        
        response = openai.chat.completions.create(
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
        raise HTTPException(status_code=500, detail=f"Erro no chat: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)