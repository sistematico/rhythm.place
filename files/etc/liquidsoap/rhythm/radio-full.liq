#!/usr/bin/env liquidsoap

# Set up the playlists
day = playlist("/radio/day.pls") # Day music
night = playlist("/radio/night.pls") # Night music
radio = switch([({8h-19h}, day), ({20h-8h}, night)])

# Add crossfading
radio = crossfade(fade_out=3., fade_in=3., duration=5., main)

# Add jingles
jingles = playlist("/radio/jingls.pls")
radio = random(weights=[1, 4], [jingles, radio])

# Just in case, a fallback
radio = fallback([radio, single("say:Rhythm Place")])

# Output to icecast both in mp3 and aac
output.icecast(%mp3, host="localhost", port=8000, password="hackme", mount="main", radio)
