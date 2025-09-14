#!/usr/bin/env bash

MACHINE="tyche"
DELETE=""

if [ "$(lsb_release -s)" == "Darwin" ]; then
  #rsync -avzz $HOME/Music/Rhythm/ nginx@${MACHINE}:/var/music/rtm/ $DELETE
  rsync -avzz nginx@${MACHINE}:/var/music/rtm/ $HOME/Music/Rhythm/
elif [ "$(lsb_release -is)" == "Arch" ] || \
  [ "$(lsb_release -is)" == "VoidLinux" ]; then
  rsync -avzz $HOME/music/rtm/ nginx@${MACHINE}:/var/music/rtm/ $DELETE
fi