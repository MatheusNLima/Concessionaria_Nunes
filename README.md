# Concessionária Nunes - Vitrine de Veículos
disponível online em: https://matheusnlima.github.io/Concessionaria_Nunes/
> Um projeto full-stack de uma vitrine digital para uma concessionária de veículos, apresentando um catálogo de carros, sistema de login de usuários e uma lista de interesses personalizada.

Este projeto foi construído do zero utilizando React no frontend e Node.js/Express com MongoDB no backend, com o objetivo de criar uma experiência de usuário moderna e funcional, desde a visualização dos produtos até a gestão de uma conta pessoal.

## ✨ Funcionalidades

*   **Vitrine de Veículos:** Exibição dos carros em um layout de cards responsivo.
*   **Busca Dinâmica:** Filtre os veículos por nome ou marca em tempo real.
*   **Paginação:** Navegação entre as páginas de resultados.
*   **Página de Detalhes:** Visualização completa de cada veículo com múltiplas fotos.
*   **Sistema de Autenticação:**
    *   Cadastro de novos usuários com senha criptografada.
    *   Login seguro com autenticação baseada em JSON Web Token (JWT).
*   **Lista de Interesses Personalizada:** Usuários logados podem favoritar veículos. Os favoritos são salvos na conta do usuário no banco de dados.
*   **Design Responsivo:** Interface adaptada para visualização em desktops e dispositivos móveis.

## 🚀 Tecnologias Utilizadas

Este projeto é dividido em duas partes principais: o frontend e o backend.

### Frontend
*   **[React](https://reactjs.org/)**: Biblioteca para construção da interface de usuário.
*   **[Vite](https://vitejs.dev/)**: Ferramenta de build para um desenvolvimento rápido e otimizado.
*   **[React Router DOM](https://reactrouter.com/)**: Para gerenciamento das rotas da aplicação (SPA).
*   **CSS Puro**: Para estilização dos componentes.

### Backend
*   **[Node.js](https://nodejs.org/)**: Ambiente de execução JavaScript no servidor.
*   **[Express.js](https://expressjs.com/)**: Framework para construção da API REST.
*   **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**: Banco de dados NoSQL na nuvem para persistência dos dados.
*   **[Mongoose](https://mongoosejs.com/)**: Biblioteca para modelagem dos dados com o MongoDB.
*   **[JSON Web Token (JWT)](https://jwt.io/)**: Para a implementação de sessões seguras.
*   **[Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)**: Para a criptografia de senhas.
*   **[CORS](https://expressjs.com/en/resources/middleware/cors.html)**: Para permitir a comunicação entre frontend e backend.
*   **[Dotenv](https://github.com/motdotla/dotenv)**: Para gerenciamento de variáveis de ambiente.

### Deploy
*   **Frontend**: Hospedado no **[GitHub Pages](https://pages.github.com/)**.
*   **Backend**: Hospedado no **[Render](https://render.com/)**.

## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar a aplicação completa na sua máquina.

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   `npm` ou `yarn`
*   Uma conta gratuita no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) para obter uma string de conexão.

### Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/MatheusNLima/aprova.git
    cd aprova
    ```

2.  **Instale as dependências do Frontend:**
    ```bash
    # Na raiz do projeto
    npm install
    ```

3.  **Instale as dependências do Backend:**
    ```bash
    # Navegue até a pasta do backend
    cd backend
    npm install
    ```

4.  **Configure as Variáveis de Ambiente do Backend:**
    *   Na pasta `backend`, crie um arquivo chamado `.env`.
    *   Copie o conteúdo do exemplo abaixo e cole no seu arquivo `.env`, substituindo com suas próprias credenciais.

    **`backend/.env.example`**
    ```
    # String de conexão do seu cluster no MongoDB Atlas
    MONGO_URI=mongodb+srv://<username>:<password>@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority

    # Chave secreta para os tokens JWT (pode ser qualquer string longa e aleatória)
    JWT_SECRET=suaChaveSuperSecretaAqui123

    # URL do seu frontend para as regras de CORS
    FRONTEND_URL=http://localhost:5173
    ```

### Rodando a Aplicação

Você precisará de **dois terminais** abertos.

1.  **Terminal 1: Iniciar o Backend**
    ```bash
    # A partir da raiz do projeto, navegue para o backend
    cd backend
    npm run dev
    ```
    Seu servidor backend estará rodando em `http://localhost:3001`.

2.  **Terminal 2: Iniciar o Frontend**
    ```bash
    # Na raiz do projeto
    npm run dev
    ```
    Sua aplicação React estará disponível em `http://localhost:5173`.


---
Feito com ❤️ por **Matheus Nunes Lima**.

[GitHub](https://github.com/MatheusNLima) | [LinkedIn](https://www.linkedin.com/in/matheus-lima-13397b1b5/)
