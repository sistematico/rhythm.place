#!/usr/bin/env bash
set -e

PATH=$PATH:/home/nginx/.bun/bin
DEPLOY_TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/var/backups/rhythm"
# CURRENT_DIR=${{ secrets.PROJECT_PATH }}
CURRENT_DIR="/var/www/rhythm.place"
HEALTH_CHECK_URL="http://localhost:4080/api/health" # Ajuste conforme sua aplicação
MAX_HEALTH_CHECKS=10
HEALTH_CHECK_INTERVAL=3

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Backup da configuração atual
[ -f .env.production ] && cp .env.production /tmp/env.rhythm

# Backup da versão atual funcionando
echo "Fazendo backup da versão atual..."
sudo systemctl is-active rhythm && {
    cd $CURRENT_DIR
    mkdir -p $BACKUP_DIR/$DEPLOY_TIMESTAMP
    cp -a .next node_modules package.json bun.lockb .env.production $BACKUP_DIR/$DEPLOY_TIMESTAMP/
    echo $DEPLOY_TIMESTAMP > $BACKUP_DIR/last_working_version
}

perform_rollback() {
    echo "Falha no deploy. Iniciando rollback..."
    
    # Verificar se existe um backup para fazer rollback
    if [ -f $BACKUP_DIR/last_working_version ]; then
        ROLLBACK_VERSION=$(cat $BACKUP_DIR/last_working_version)
        
        if [ -d $BACKUP_DIR/$ROLLBACK_VERSION ]; then
            echo "Restaurando versão: $ROLLBACK_VERSION"
            sudo systemctl stop rhythm
            
            # Restaurar arquivos críticos da última versão funcional
            cp -a $BACKUP_DIR/$ROLLBACK_VERSION/.next $CURRENT_DIR/
            cp -a $BACKUP_DIR/$ROLLBACK_VERSION/node_modules $CURRENT_DIR/
            [ -f $BACKUP_DIR/$ROLLBACK_VERSION/.env.production ] && \
                cp $BACKUP_DIR/$ROLLBACK_VERSION/.env.production $CURRENT_DIR/
            
            # Iniciar serviço com a versão antiga
            sudo systemctl start rhythm
            
            # Verificar se o rollback foi bem-sucedido
            echo "Verificando saúde após rollback..."
            for i in $(seq 1 $MAX_HEALTH_CHECKS); do
                sleep $HEALTH_CHECK_INTERVAL
                if curl -s -f $HEALTH_CHECK_URL > /dev/null; then
                    echo "Rollback bem-sucedido! Site restaurado com a versão anterior."
                    exit 0
                fi
                echo "Tentativa $i de $MAX_HEALTH_CHECKS - Serviço ainda não respondendo..."
            done
            
            echo "ALERTA CRÍTICO: Rollback falhou. O site pode estar offline!"
            exit 1
        fi
    fi
    
    echo "ALERTA CRÍTICO: Não foi possível fazer rollback. Nenhum backup válido encontrado!"
    exit 1
}

# Trap para capturar erros e iniciar rollback
trap perform_rollback ERR

# Parar o serviço
sudo /usr/bin/systemctl stop rhythm

# Limpeza e preparação para o novo build
git clean -fxd

# Restaurar variáveis de ambiente
[ -f /tmp/env.rhythm ] && cp /tmp/env.rhythm .env.production
cp -f .env.production .env

# Instalar dependências e construir
echo "Instalando dependências..."
bun install

echo "Atualizando banco de dados..."
bun run db:push
bun run db:seed

echo "Construindo aplicação..."
bun run build

# Iniciar serviço
echo "Iniciando serviço..."
sudo /usr/bin/systemctl start rhythm

# Verificar saúde do serviço após o deploy
echo "Verificando saúde do serviço..."
for i in $(seq 1 $MAX_HEALTH_CHECKS); do
    sleep $HEALTH_CHECK_INTERVAL
    if curl -s -f $HEALTH_CHECK_URL > /dev/null; then
        echo "Deploy bem-sucedido! Site está respondendo corretamente."
        exit 0
    fi
    echo "Tentativa $i de $MAX_HEALTH_CHECKS - Serviço ainda não respondendo..."
done

# Se chegou aqui, o serviço não está respondendo corretamente
echo "Deploy falhou na verificação de saúde. Iniciando rollback..."
perform_rollback