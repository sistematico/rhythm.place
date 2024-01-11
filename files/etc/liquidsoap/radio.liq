#!/usr/bin/env liquidsoap

def cross(g)
  crossfade(fade_out=3., fade_in=3., duration=5., g)
end

def next(g)
  # Esta função interna `request_function` será chamada para cada nova faixa
  def request_function() =
    # Obtém a URI da próxima faixa
    uri = list.hd(process.read.lines("SONGS_PATH=/media/songs /home/liquidsoap/.bun/bin/bun /var/www/rhythm.place/apps/api/src/engine.ts #{g}"))
    
    # Cria um request com a URI obtida
    request.create(uri)
  end

  # Retorna uma fonte dinâmica que utiliza a função `request_function`
  request.dynamic(request_function)
end


# def next(g)
#   uri = list.hd(process.read.lines("SONGS_PATH=/media/songs /home/liquidsoap/.bun/bin/bun /var/www/rhythm.place/apps/api/src/engine.ts #{g}"))
#   request.create(uri)
# end

main = next('main')
dance = next('dance')
rock = next('rock')
seventies = next('seventies')
eighties = next('eighties')
nineties = next('nineties')

jingle = single("say:Rhythm Place")
main = fallback([cross(main), jingle])
dance = fallback([cross(dance), jingle])
rock = fallback([cross(rock), jingle])
seventies = fallback([cross(seventies), jingle])
eighties = fallback([cross(eighties), jingle])
nineties = fallback([cross(nineties), jingle])

output.icecast(%mp3, 
  name='Rhythm Place',
  genre='Various',
  description='O melhor da música!',
  url='https://rhythm.place',
  host="localhost", 
  port=8000, 
  password="hackme", 
  mount="main", 
  fallible=true,
  main)

output.icecast(%mp3, 
  name='Rhythm Place - Dance',
  genre='Dance',
  description='O melhor do dance!',
  url='https://rhythm.place',
  host="localhost", 
  port=8002, 
  password="hackme", 
  mount="dance", 
  fallible=true,
  dance)

output.icecast(%mp3, 
  name='Rhythm Place - Rock',
  genre='Rock',
  description='O melhor do rock!',
  url='https://rhythm.place',
  host="localhost", 
  port=8004, 
  password="hackme", 
  mount="rock", 
  fallible=true,
  rock)

output.icecast(%mp3, 
  name='Rhythm Place - 70s',
  genre='Seventies',
  description='O melhor dos anos 70!',
  url='https://rhythm.place',
  host="localhost", 
  port=8006, 
  password="hackme", 
  mount="seventies", 
  fallible=true,
  seventies)

output.icecast(%mp3, 
  name='Rhythm Place - 80s',
  genre='Eighties',
  description='O melhor dos anos 80!',
  url='https://rhythm.place',
  host="localhost", 
  port=8008, 
  password="hackme", 
  mount="eighties", 
  fallible=true,
  eighties)

output.icecast(%mp3, 
  name='Rhythm Place - 90s',
  genre='Nineties',
  description='O melhor dos anos 90!',
  url='https://rhythm.place',
  host="localhost", 
  port=8010, 
  password="hackme", 
  mount="nineties", 
  fallible=true,
  nineties)

