#!/usr/bin/env liquidsoap

def next()
  uri = list.hd(process.read.lines("SONGS_PATH=/media/songs /home/liquidsoap/.bun/bin/bun /var/www/rhythm.place/apps/api/src/engine.ts"))
  request.create(uri)

  # Aqui você adicionaria lógica para mapear a URI para a URL da capa. 
  # Por exemplo, você poderia ter um arquivo ou banco de dados que associa URIs a URLs de capas.
  # cover = get_cover_url(uri)

  # Para este exemplo, vamos apenas simular uma URL de capa.
  #cover = "http://example.com/covers/" ^ uri ^ ".jpg"

  # Anotando a faixa com a URL da capa
  #request.create("annotate:cover=cover.jpg":uri)
end

bun = request.dynamic(next)

jingle = single("say:Rhythm Place")
cross = crossfade(fade_out=3., fade_in=3., duration=5., bun)
radio = fallback([cross, jingle])

dance = random(weights=[1, 1], [jingle, radio])
rock = random(weights=[1, 1], [jingle, radio])

output.icecast(%mp3, 
  name='Rhythm Place - Dance',
  genre='Various',
  description='O melhor do dance!',
  url='https://rhythm.place',
  host="localhost", 
  port=8000, 
  password="hackme", 
  mount="dance", 
  fallible=true,
  dance)

output.icecast(%mp3, 
  name='Rhythm Place - Rock',
  genre='Dance',
  description='O melhor do rock!',
  url='https://rhythm.place',
  host="localhost", 
  port=8002, 
  password="hackme", 
  mount="rock", 
  fallible=true,
  rock)

