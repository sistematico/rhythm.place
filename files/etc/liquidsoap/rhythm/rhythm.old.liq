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
    lines = process.read.lines("curl https://api.rhythm.place#{g}")
    uri = list.hd(default="",lines)
    request.create(uri)
  end
  request.dynamic(request_function)
end

main = next('')
dance = next('/dance')
rock = next('/rock')
seventies = next('/70s')
eighties = next('/80s')
nineties = next('/90s')

# main = cross(main)
# dance = fallback([cross(dance), rhythm])
# rock = fallback([cross(rock), rhythm])
# seventies = fallback([cross(seventies), rhythm])
# eighties = fallback([cross(eighties), rhythm])
# nineties = fallback([cross(nineties), rhythm])



