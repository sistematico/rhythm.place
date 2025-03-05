#!/usr/bin/env bash

PATH=$PATH:/home/nginx/.bun/bin

[ -f .env.production ] && cp .env.production /tmp/env.rhythm

sudo /usr/bin/systemctl stop rhythm

git clean -fxd

[ -f /tmp/env.rhythm ] && cp /tmp/env.rhythm .env.production

bun install
bun run db:push
bun run db:seed
bun run build
sudo /usr/bin/systemctl start rhythm