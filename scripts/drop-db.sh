#!/bin/bash

PGHOST="localhost"   # Ou IP do servidor
PGPORT="5432"
PGUSER="rhythm"
PGDATABASE="rhythm"

echo "🔄 Conectando ao PostgreSQL e limpando o banco de dados '$PGDATABASE'..."

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "
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

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "REINDEX DATABASE \"$PGDATABASE\";"
echo "✅ Índices reconstruídos."

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "VACUUM FULL;"
echo "✅ Banco otimizado."

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "ANALYZE;"
echo "✅ Estatísticas recalculadas."

echo "🎉 Limpeza completa no banco '$PGDATABASE'."