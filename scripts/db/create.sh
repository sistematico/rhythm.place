#!/bin/bash

# Importa as variáveis do arquivo .env
source "$(dirname "$0")/../other/read_env.sh"

# Define as credenciais do banco de dados
[ $1 ] && DB_PASS="$1"

# Executa os comandos no PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
echo "✅ Banco de dados $DB_NAME criado."

sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"
echo "✅ Usuário $DB_USER criado."

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "✅ Privilégios ao banco $DB_NAME adicionados a $DB_USER."

sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
echo "✅ Privivlégios ao esquema 'public' adicionados ao usuário $DB_USER para o banco ${DB_NAME}."

# Verifica se a linha DATABASE_URL já existe
if grep -q "DATABASE_URL" $ENV_FILE; then
    # Se existir, substitui a linha
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public\"|" $ENV_FILE
    echo "✅ Linha postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public atualizada no arquivo $ENV_FILE"
else
    # Se não existir, adiciona a linha ao final do arquivo
    echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public\"" >> $ENV_FILE
    echo "✅ Linha postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public adicionada no arquivo $ENV_FILE"
fi

# Informa ao usuário que a operação foi concluída
echo "Credenciais do banco de dados escritas ou atualizadas no arquivo $ENV_FILE"
echo "🎉 Banco de dados $DB_NAME criado com sucesso."
