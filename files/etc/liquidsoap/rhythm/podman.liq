#!/usr/bin/env liquidsoap

main = playlist("/home/lucas/audio")
#radio = crossfade(fade_out=3., fade_in=3., duration=5., main)
radio = fallback([radio, single("say:Rhythm Place")])
output.icecast(%mp3, host="localhost", port=8000, password="hackme", mount="main", radio)
