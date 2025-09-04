#!/usr/bin/env bash

MACHINE="tyche"
DELETE=""

if [ "$(lsb_release -s)" == "Darwin" ] || \
  [ "$(lsb_release -is)" == "Arch" ] || \
  [ "$(lsb_release -is)" == "VoidLinux" ]; then
  rsync -avzz $HOME/music/rp/ nginx@${MACHINE}:/var/music/rp/ $DELETE
fi