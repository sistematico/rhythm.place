#!/bin/bash

[ $EUID != 0 ] && exit

cp files/somdomato-hono.service /etc/systemd/system/
cp files/somdomato-hono /etc/sudoers.d/

systemctl daemon-reload 
systemctl enable somdomato-hono
systemctl restart somdomato-hono