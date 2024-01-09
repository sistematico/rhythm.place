#!/bin/sh

NAME="somdomato"
CONTAINER="${NAME}_postgres"
SCRIPT_PATH="$(dirname "$(realpath "$0")")"
PROJECT_PATH="$(dirname $SCRIPT_PATH)"
VISUAL="${VISUAL:-code}"
BROWSER="${BROWSER:-firefox}"

if podman inspect "$CONTAINER" > /dev/null 2> /dev/null; then
    if podman container inspect -f '{{.State.Running}}' $CONTAINER | grep false; then
        podman start $CONTAINER
    fi
fi

\tmux -f ${PROJECT_PATH}/scripts/.tmux.conf new-session -A -d -s $NAME -n project
\tmux send-keys -t $NAME:project "cd ${PROJECT_PATH} ; clear" ENTER

\tmux new-window -t $NAME -n client -d
\tmux send-keys -t $NAME:client "clear ; cd ${PROJECT_PATH}/packages/site ; bun run dev" ENTER

\tmux new-window -t $NAME -n server -d
\tmux send-keys -t $NAME:server "clear ; cd ${PROJECT_PATH}/packages/api ; bun run dev" ENTER

\tmux new-window -t $NAME -n studio -d
\tmux send-keys -t $NAME:studio "clear ; cd ${PROJECT_PATH}/packages/api ; bunx prisma studio" ENTER

$BROWSER 'http://localhost:5173' &
$VISUAL ${PROJECT_PATH}
