#!/usr/bin/env liquidsoap

def next_dance()
  uri = list.hd(process.read.lines("SONGS_PATH=/media/songs /home/liquidsoap/.bun/bin/bun /var/www/rhythm.place/apps/api/src/engine.ts dance"))
  request.create(uri)
end
bun_dance = request.dynamic(next_dance)

def next_rock()
  uri = list.hd(process.read.lines("SONGS_PATH=/media/songs /home/liquidsoap/.bun/bin/bun /var/www/rhythm.place/apps/api/src/engine.ts rock"))
  request.create(uri)
end
bun_rock = request.dynamic(next_rock)

jingle = single("say:Rhythm Place")
cross_dance = crossfade(fade_out=3., fade_in=3., duration=5., bun_dance)
cross_rock = crossfade(fade_out=3., fade_in=3., duration=5., bun_rock)
radio_dance = fallback([cross_dance, jingle])
radio_rock = fallback([cross_rock, jingle])

dance = random(weights=[1, 1], [jingle, radio_dance])
rock = random(weights=[1, 1], [jingle, radio_rock])

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

