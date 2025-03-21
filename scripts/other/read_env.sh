#!/bin/bash

# Define o arquivo .env padrão
ENV_FILE=".env.production"
[ -f /etc/arch-release ] || [ -f ".env" ] && ENV_FILE=".env"

# Verifica se o arquivo existe
if [ ! -f "$ENV_FILE" ]; then
    echo "Erro: Arquivo $ENV_FILE não encontrado."
    exit 1
fi

# Lê a variável DATABASE_URL do arquivo .env
DB_URL=$(grep -E "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'")

# Verifica se encontrou a variável
if [ -z "$DB_URL" ]; then
    echo "Erro: DATABASE_URL não encontrada no arquivo $ENV_FILE."
    exit 1
fi

# Extrai os componentes da string de conexão
# Formato: postgresql://username:password@host:port/database

# Extrai o usuário
DB_USER=$(echo "$DB_URL" | sed -n 's/^postgresql:\/\/\([^:]*\):.*/\1/p')

# Extrai a senha
DB_PASS=$(echo "$DB_URL" | sed -n 's/^postgresql:\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Extrai o host
DB_HOST=$(echo "$DB_URL" | sed -n 's/^postgresql:\/\/[^@]*@\([^:]*\):.*/\1/p')

# Extrai a porta
DB_PORT=$(echo "$DB_URL" | sed -n 's/^postgresql:\/\/[^:]*:[^@]*@[^:]*:\([^/]*\)\/.*/\1/p')

# Extrai o nome do banco de dados
DB_NAME=$(echo "$DB_URL" | sed -n 's/^postgresql:\/\/[^/]*\/\([^?]*\).*/\1/p')

# Exibe as informações extraídas (para verificação)
# echo "Informações do banco de dados:"
# echo "Usuário: $DB_USER"
# echo "Host: $DB_HOST"
# echo "Porta: $DB_PORT"
# echo "Banco de dados: $DB_NAME"

# Exporta as variáveis para uso em outros scripts
export DB_USER
export DB_PASS
export DB_HOST
export DB_PORT
export DB_NAME
export ENV_FILE