#!/bin/bash

# Script para deploy em múltiplos ambientes

ENV=$1

case $ENV in
  "local")
    echo "Iniciando ambiente local..."
    # Inicia backend Node.js
    cd backend && npm install && npm run dev &
    
    # Inicia backend Python
    cd ia-service && pip install -r requirements.txt && python main.py &
    
    # Inicia frontend
    cd frontend && npm install && npm run dev
    ;;
    
  "render")
    echo "Fazendo deploy no Render..."
    # Configurações específicas para o Render
    cd backend && npm install && npm start
    ;;
    
  "gh-pages")
    echo "Fazendo deploy no GitHub Pages..."
    cd frontend && npm install && npm run build
    npm run deploy
    ;;
    
  *)
    echo "Uso: ./deploy.sh [local|render|gh-pages]"
    exit 1
    ;;
esac