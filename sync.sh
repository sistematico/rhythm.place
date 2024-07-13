#!/bin/bash

MAQUINA="eris"

ssh root@$MAQUINA "mkdir -p /media/rhythm/{main,rock,dance,70s,80s,90s}"
rsync -avzz /home/lucas/audio/rhythm/ root@$MAQUINA:/media/rhythm/principal/
rsync -avzz files/etc/liquidsoap/ root@$MAQUINA:/etc/liquidsoap/ --exclude="*old*" --exclude="*radio*" --exclude="*bun*" --exclude="*podman*"
scp files/etc/icecast2/rhythm.xml root@$MAQUINA:/etc/icecast2/
scp files/etc/systemd/system/* root@$MAQUINA:/etc/systemd/system/
scp files/etc/nginx/sites-available/* root@$MAQUINA:/etc/nginx/sites-available/
scp files/etc/letsencrypt/renewal-hooks/deploy/icecast-certificates-rhythm root@$MAQUINA:/etc/letsencrypt/renewal-hooks/deploy/
ssh root@$MAQUINA "chown -R liquidsoap:liquidsoap /media/rhythm/ && systemctl restart nginx icecast2-rhythm liquidsoap-rhythm"
#rsync -avzz ~/audio/rhythm/ root@eris:/media/rhythm/ --delete