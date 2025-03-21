#!/bin/bash

# Carrega variáveis de ambiente
source "$(dirname "$0")/../other/read_env.sh"

# Define senha
PGPASSWORD="$DB_PASS"
[ $1 ] && PGPASSWORD="$1"
export PGPASSWORD

echo "🚨 ATENÇÃO: Apagando banco de dados '$DB_NAME'"
# read -p "Pressione ENTER para continuar ou CTRL+C para cancelar..." -r

# Desconecta usuários
echo "🔄 Desconectando usuários..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
"

# Apaga e recria o banco
echo "🗑️ Apagando banco de dados..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"

echo "🔄 Recriando banco de dados..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE \"$DB_NAME\" WITH OWNER = \"$DB_USER\";"

# Aplica schema inicial (opcional)
if [ -f "../sql/init_schema.sql" ]; then
  echo "🔄 Aplicando schema inicial..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "../sql/init_schema.sql"
fi

echo "✅ Banco '$DB_NAME' recriado com sucesso."