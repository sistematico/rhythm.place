#!/usr/bin/env liquidsoap

rhythm = sleeper(delay=.60, single("say:Rhythm Place"))

# p = playlist("/music")
# s = request.dynamic(rq)
# r = fallback(track_sensitive=false, [p,s])
# m = mksafe(r)

def cross(g)
  crossfade(fade_out=3., fade_in=3., duration=5., g)
end

def next(g)
  def request_function() =
    lines = process.read.lines("curl https://api.rhythm.place/#{g}")
    uri = list.hd(default="",lines)
    request.create(uri)
  end
  request.dynamic(request_function)
end

main = next('main')
dance = next('dance')
rock = next('rock')
seventies = next('70s')
eighties = next('80s')
nineties = next('90s')

main = cross(main)
dance = fallback([cross(dance), rhythm])
rock = fallback([cross(rock), rhythm])
seventies = fallback([cross(seventies), rhythm])
eighties = fallback([cross(eighties), rhythm])
nineties = fallback([cross(nineties), rhythm])

# output.icecast(%vorbis,
#   host = "icecast", port = 8000,
#   password = "hackme", mount = "radio.ogg",
#   m)

output.icecast(%mp3, 
  name='Rhythm Place',
  genre='Varios',
  description='O melhor da música!',
  url='https://rhythm.place',
  host="localhost", 
  port=9000, 
  password="hackme", 
  mount="main", 
  mksafe(main))

output.icecast(%mp3, 
  name='Rhythm Place - Dance',
  genre='Dance',
  description='O melhor do dance!',
  url='https://rhythm.place',
  host="localhost", 
  port=9002, 
  password="hackme", 
  mount="dance", 
  dance)

output.icecast(%mp3, 
  name='Rhythm Place - Rock',
  genre='Rock',
  description='O melhor do rock!',
  url='https://rhythm.place',
  host="localhost", 
  port=9004, 
  password="hackme", 
  mount="rock",
  rock) 

output.icecast(%mp3, 
  name='Rhythm Place - 70s',
  genre='Seventies',
  description='O melhor dos anos 70!',
  url='https://rhythm.place',
  host="localhost", 
  port=9006, 
  password="hackme", 
  mount="70s", 
  seventies)

output.icecast(%mp3, 
  name='Rhythm Place - 80s',
  genre='Eighties',
  description='O melhor dos anos 80!',
  url='https://rhythm.place',
  host="localhost", 
  port=9008, 
  password="hackme", 
  mount="80s", 
  eighties)

output.icecast(%mp3, 
  name='Rhythm Place - 90s',
  genre='Nineties',
  description='O melhor dos anos 90!',
  url='https://rhythm.place',
  host="localhost", 
  port=9010, 
  password="hackme", 
  mount="90s", 
  nineties)