#!/usr/bin/env bash

CONTAINER_NAME=rhythm-postgres
POSTGRES_VERSION=16
POSTGRES_DB=rhythm
POSTGRES_USER=rhythm
POSTGRES_PASS=rhythm

if ! podman image exists postgres:$POSTGRES_VERSION; then
  podman pull postgres:$POSTGRES_VERSION
fi

# Verifica se o container existe
if ! podman container exists $CONTAINER_NAME; then
  echo "Creating and starting PostgreSQL container..."
  podman run -d \
    --name $CONTAINER_NAME \
    -e POSTGRES_DB=$POSTGRES_DB \
    -e POSTGRES_USER=$POSTGRES_USER \
    -e POSTGRES_PASSWORD=$POSTGRES_PASS \
    -p 5432:5432 \
    postgres:$POSTGRES_VERSION
else
  # Verifica se o container já está rodando
  if podman ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "Container is already running. No action needed."
  else
    echo "Starting existing PostgreSQL container..."
    podman start $CONTAINER_NAME
  fi
fi