#!/usr/bin/liquidsoap

# First, include the config file
%include "config.liq"

# Define uma playlist dinâmica que pode ser atualizada em tempo real
dynamic_playlist = request.dynamic(fun () -> request.create(""), id="dynamic_playlist")

# Função para adicionar uma nova faixa à playlist dinâmica
def add_track_to_playlist(path)
  r = request.create(path)
  request.dynamic.queue(dynamic_playlist, r)
end

# Registra o comando personalizado 'custom.add_track' no servidor Telnet
server.register(namespace="custom", name="add_track", description="Adiciona uma faixa à playlist dinâmica", f=add_track_to_playlist)

# Define uma função para carregar uma nova faixa antes do término da atual
def queue_next_track(remaining, _)
  if remaining < 10.0 then
    log("Carregando próxima faixa, restam #{remaining} segundos na atual.")
    system("bun /var/www/rhythm.place/src/cli.ts")
  end
end

# Aplica a função 'queue_next_track' ao final de cada faixa
dynamic_playlist = source.on_metadata(queue_next_track, dynamic_playlist)

# Define o AutoDJ como fallback, tocando músicas aleatórias de um diretório específico
autodj = playlist(reload_mode="watch", mode="random", "/home/rhythm/music")

# Setup input from harbor
live = input.harbor("aovivo", port = 8080, password = "hackme")

# Main radio stream with fallbacks in order:
# 1. Live input
# 2. Dynamic playlist
# 3. AutoDJ (random songs from directory)
radio = fallback(track_sensitive=false, [live, dynamic_playlist, autodj])

# Output configuration
output.icecast(
  %mp3(bitrate=128, samplerate=44100, id3v2=true),
  host = "localhost",
  port = 8000,
  password = "hackme",
  mount = "/main",
  name = "Rhythm Place",
  description = "A place to dance!",
  genre = "Dance",
  url="https://rhythm.place",
  icy_metadata="true",
  mksafe(radio)
)