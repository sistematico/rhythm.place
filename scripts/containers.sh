#!/bin/bash

# Defina suas variáveis personalizadas aqui
NAME="somdomato"
POSTGRES_VERSION=14.0
DB_NAME="$NAME"
DB_USER="$NAME"
DB_PASSWORD="password"

if ! podman container exists ${NAME}_bun; then
    podman pull oven/bun
    podman run -d --name ${NAME}_bun -v /home/lucas/audio/sdm:/media/songs oven/bun
else
    podman start ${NAME}_bun
fi

if ! podman container exists ${NAME}_icecast; then
    podman pull pltnk/icecast2
    podman run -d --name ${NAME}_icecast -p 8000:8000 pltnk/icecast2
else
    podman start ${NAME}_icecast
fi

if ! podman container exists ${NAME}_liquidsoap; then
    podman pull pltnk/liquidsoap
    podman run -d --name ${NAME}_liquidsoap pltnk/liquidsoap
else
    podman start ${NAME}_liquidsoap
fi

if ! podman container exists ${NAME}_postgres; then
    podman pull postgres:14.0
    podman run -d \
      --name ${NAME}_postgres \
      -e POSTGRES_DB=$DB_NAME \
      -e POSTGRES_USER=$DB_USER \
      -e POSTGRES_PASSWORD=$DB_PASSWORD \
      -p 5432:5432 \
      postgres:14.0
else
    podman start ${NAME}_postgres
fi