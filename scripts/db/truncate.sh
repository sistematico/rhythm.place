#!/bin/bash

source "$(dirname "$0")/../other/read_env.sh"

PGPASSWORD="$DB_PASS"
[ $1 ] && PGPASSWORD="$1"
export PGPASSWORD

echo "🔄 Conectando ao PostgreSQL e limpando o banco de dados '$DB_NAME'..."

# Apagar todos os dados das tabelas
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
DO \$\$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END \$\$;
"

echo "✅ Dados apagados com sucesso."

# Resetar os índices do banco - usando usuário postgres (superusuário) e conectando ao banco específico
sudo -u postgres psql -d "$DB_NAME" -c "REINDEX DATABASE \"$DB_NAME\";"
echo "✅ Índices reconstruídos."

# Obter lista de tabelas do usuário e executar VACUUM FULL em cada uma
echo "🔄 Otimizando espaço nas tabelas do usuário..."
for TABLE in $(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"); do
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "VACUUM FULL $TABLE;"
done
echo "✅ Banco otimizado."

# Recalcular estatísticas apenas para tabelas do usuário
echo "🔄 Recalculando estatísticas..."
for TABLE in $(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"); do
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE $TABLE;"
done
echo "✅ Estatísticas recalculadas."

echo "🎉 Limpeza completa no banco '$DB_NAME'."