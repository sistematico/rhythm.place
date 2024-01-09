def get_proxima_musica() =
  arquivo = "/caminho/para/proxima_musica.ts"
  resultado = list.hd(default="", get_process_output("cat #{arquivo}"))
  resultado
end

fonte_dinamica = request.dynamic(request_id=false, fun () -> request.create(get_proxima_musica()))

output.icecast(%mp3,
  host = "localhost", port = 8000,
  password = "sua_senha", mount = "/mymount",
  fonte_dinamica
)