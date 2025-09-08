#!/usr/bin/env bash

MACHINE="tyche"
DELETE=""

if [ "$(lsb_release -s)" == "Darwin" ] || \
  [ "$(lsb_release -is)" == "Arch" ] || \
  [ "$(lsb_release -is)" == "VoidLinux" ]; then
  rsync -avzz $HOME/music/rtm/ nginx@${MACHINE}:/var/music/rtm/ $DELETE
fi