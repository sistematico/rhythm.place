#!/usr/bin/env liquidsoap

# Configuração do input ao vivo
live = input.harbor("aovivo", port=8010, user="dj", password="hackme")

# Função para buscar próxima música do Next.js
def next()
  def request_function() =
    # Chama a API do Next.js (ajuste a porta se necessário)
    lines = process.read.lines("curl -s http://localhost:3333/api/song")
    uri = list.hd(default="", lines)
    
    # Log para depuração (verifique no terminal)
    log("Próxima música: #{uri}")
    
    request.create(uri)
  end
  request.dynamic(id="next_track", request_function)
end

# Cria a fonte de música automática
autodj = next()

# Prioridade: transmissão ao vivo > autodj
radio = fallback(track_sensitive=false, [live, autodj])

# Adiciona transições suaves entre músicas
#radio = crossfade(radio)

output.icecast(
  %mp3(bitrate=128, samplerate=44100, id3v2=true), 
  name = "Radio Som do Mato",
  description = "A mais sertaneja!",
  genre = "Sertanejo",
  url = "https://somdomato.com",
  host = "localhost", 
  port = 8000, 
  password = "hackme", 
  mount = "/radio.mp3", 
  encoding = "UTF-8",
  mksafe(radio))