#!/usr/bin/env liquidsoap

%include "/etc/liquidsoap/bun.liq"

#main = playlist("/media/songs")
#cross = crossfade(fade_out=3., fade_in=3., duration=5., main)
cross = crossfade(fade_out=3., fade_in=3., duration=5., bun)

#jingle = single("say:Rhythm Place")
radio = fallback([cross, single("say:Rhythm Place")])

main = random(weights=[1, 1], [jingle, radio])

output.icecast(%mp3, 
  name='Rhythm Place',
  genre='Dance',
  description='O melhor do dance!',
  url='https://rhythm.place',
  host="localhost", 
  port=8000, 
  password="hackme", 
  mount="main", 
  fallible=true,
  main)
