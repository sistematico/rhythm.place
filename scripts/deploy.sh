#!/usr/bin/env bash

PATH=$PATH:/home/nginx/.bun/bin

[ -f .env.production ] && cp .env.production /tmp/env.rhythm

git clean -fxd

[ -f /tmp/env.rhythm ] && cp /tmp/env.rhythm .env.production

sudo /usr/bin/systemctl stop rhythm
bun install
bun run build
sudo /usr/bin/systemctl start rhythm