def next()
  uri = list.hd(process.read.lines("SONGS_PATH=/media/songs /home/liquidsoap/.bun/bin/bun /var/www/rhythm.place/apps/api/src/engine.ts"))
  request.create(uri)
end

bun = request.dynamic(next)