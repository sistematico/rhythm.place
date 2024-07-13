#!/usr/bin/env liquidsoap

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

%include "outputs.ogg.liq"
