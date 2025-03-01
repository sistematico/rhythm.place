#!/usr/bin/liquidsoap

%include "config.liq"
%include "node.liq"
%include "playlist.liq"

live = input.harbor("aovivo", port = 8080, password = "hackme")
radio = fallback(track_sensitive=false, [live, audio])

%include "output.liq"