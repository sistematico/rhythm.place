#def autodj() =
#    uri = list.hd(default="", process.read.lines('sudo -u nginx /usr/bin/node /var/www/api.rhythm.place/src/console.js', timeout=10.))
#    request.create(uri)
#end
#node = request.dynamic(autodj)

# Define uma playlist dinâmica que pode ser atualizada em tempo real
dynamic_playlist = request.dynamic(fun () -> request.create(""), id="dynamic_playlist")

# Função para adicionar uma nova faixa à playlist dinâmica
def add_track_to_playlist(path)
  r = request.create(path)
  request.queue(~source=dynamic_playlist, r)
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
radio = source.on_metadata(queue_next_track, dynamic_playlist)