#!/bin/bash

# Define as credenciais do banco de dados
DB_NAME="somdomato"
DB_USER="somdomato"
DB_PASS="password"
DB_HOST="localhost"
DB_PORT="5432"

# Executa os comandos no PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Verifica se a linha DATABASE_URL já existe
if grep -q "DATABASE_URL" .env; then
    # Se existir, substitui a linha
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public\"|" .env
else
    # Se não existir, adiciona a linha ao final do arquivo
    echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public\"" >> .env
fi

# Informa ao usuário que a operação foi concluída
echo "Credenciais do banco de dados escritas ou atualizadas no arquivo .env"
