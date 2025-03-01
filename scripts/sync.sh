#!/usr/bin/env bash

if [ -f /etc/arch-release ]; then
  rsync -avzz --delete $HOME/audios/dance/ rhythm@tyche:/home/rhythm/music/
  rsync -avzz --delete $HOME/cdn/rhythm.place/ nginx@tyche:/var/www/cdn.rhythm.place/
fi