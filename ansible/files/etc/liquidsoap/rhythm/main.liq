#!/usr/bin/liquidsoap

log.file.path.set("/var/log/liquidsoap/liquidsoap.log")
log.stdout.set(true)
settings.server.telnet.set(true)
settings.harbor.bind_addrs.set(["0.0.0.0"])

def requests() =
  result = list.hd(default="", process.read.lines("/home/liquidsoap/.bun/bin/bun /var/www/rhythm.place/src/cli.ts"))
  [request.create(result)]
end

r = request.dynamic.list(requests)
a = playlist(reload_mode="watch", mode="random", "/home/rhythm/music")
l = input.harbor("aovivo", port = 8080, password = "hackme")

radio = fallback(track_sensitive=false, [l, r, a])

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