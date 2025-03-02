#!/usr/bin/env bash
# script: rhythm-stack.sh
# Descrição: Inicia todos os serviços necessários para o Rhythm Place

# ======================
# CONFIGURAÇÕES GERAIS
# ======================
POD_NAME="rhythm-stack"
MUSIC_DIR="$HOME/audios/rhythm"
CONFIG_DIR="$HOME/rhythm/config"
PG_DATA_DIR="$HOME/rhythm/postgres-data"

# Configurações PostgreSQL
PG_CONTAINER="rhythm-postgres"
PG_VERSION=16
PG_DB="rhythm"
PG_USER="rhythm"
PG_PASS="rhythm"

# Configurações Icecast
IC_CONTAINER="rhythm-icecast"
ICECAST_PORT=8000
ICECAST_IMAGE="moul/icecast2"

# Configurações Liquidsoap
LS_CONTAINER="rhythm-liquidsoap"
HARBOR_PORT=8080
LIQUIDSOAP_IMAGE="liquidsoap/liquidsoap:2.1.3"

# ======================
# PREPARAÇÃO DO AMBIENTE
# ======================
mkdir -p "$MUSIC_DIR" "$CONFIG_DIR" "$PG_DATA_DIR"

# ======================
# CONFIGURAÇÃO DO ICECAST
# ======================
cat << EOF > "$CONFIG_DIR/icecast.xml"
<icecast>
    <limits>
        <clients>100</clients>
        <sources>4</sources>
        <source-password>hackme</source-password>
        <admin-password>hackme</admin-password>
    </limits>
    <listen-socket>
        <port>${ICECAST_PORT}</port>
    </listen-socket>
</icecast>
EOF

# ======================
# CONFIGURAÇÃO DO LIQUIDSOAP
# ======================
cat << EOF > "$CONFIG_DIR/radio.liq"
#!/usr/bin/liquidsoap
set("log.file.path", "/var/log/liquidsoap.log")
playlist = playlist(id="main", mode="random", "/music")
live = input.harbor("live", port=${HARBOR_PORT}, password="hackme")
radio = fallback(track_sensitive=false, [live, playlist])
output.icecast(
  %mp3(bitrate=128),
  host="localhost",
  port=${ICECAST_PORT},
  password="hackme",
  mount="/stream",
  mksafe(radio)
)
EOF

# ======================
# GERENCIAMENTO DO POD
# ======================
if ! podman pod exists "$POD_NAME"; then
  echo "Criando pod para serviços..."
  podman pod create --name "$POD_NAME" \
    -p $ICECAST_PORT:$ICECAST_PORT \
    -p $HARBOR_PORT:$HARBOR_PORT \
    -p 5432:5432
fi

# ======================
# SERVIÇO POSTGRESQL
# ======================
if ! podman container exists $PG_CONTAINER; then
  echo "Iniciando PostgreSQL..."
  podman run -d --pod "$POD_NAME" \
    --name $PG_CONTAINER \
    -v "$PG_DATA_DIR:/var/lib/postgresql/data:Z" \
    -e POSTGRES_DB=$PG_DB \
    -e POSTGRES_USER=$PG_USER \
    -e POSTGRES_PASSWORD=$PG_PASS \
    postgres:$PG_VERSION
else
  if ! podman inspect -f '{{.State.Running}}' $PG_CONTAINER | grep -q true; then
    echo "Reiniciando PostgreSQL..."
    podman start $PG_CONTAINER
  fi
fi

# ======================
# SERVIÇOS DE STREAMING
# ======================
# Icecast
if ! podman container exists $IC_CONTAINER; then
  podman run -d --pod "$POD_NAME" \
    --name $IC_CONTAINER \
    -v "$CONFIG_DIR/icecast.xml:/etc/icecast2/icecast.xml:Z" \
    $ICECAST_IMAGE icecast -c /etc/icecast2/icecast.xml
fi

# Liquidsoap
if ! podman container exists $LS_CONTAINER; then
  podman run -d --pod "$POD_NAME" \
    --name $LS_CONTAINER \
    -v "$MUSIC_DIR:/music:Z" \
    -v "$CONFIG_DIR/radio.liq:/etc/liquidsoap/radio.liq:Z" \
    $LIQUIDSOAP_IMAGE liquidsoap /etc/liquidsoap/radio.liq
fi

# ======================
# VERIFICAÇÃO FINAL
# ======================
echo -e "\nServiços iniciados com sucesso!"
echo "-----------------------------------"
echo "PostgreSQL:"
echo "  Banco: $PG_DB | User: $PG_USER | Senha: $PG_PASS"
echo "  Porta: 5432"
echo -e "\nStreaming:"
echo "  Admin: http://localhost:$ICECAST_PORT/admin"
echo "  Stream: http://localhost:$ICECAST_PORT/stream"
echo "  Senhas: hackme"
echo -e "\nDiretórios:"
echo "  Músicas: $MUSIC_DIR"
echo "  Configurações: $CONFIG_DIR"
echo "  Dados PostgreSQL: $PG_DATA_DIR"