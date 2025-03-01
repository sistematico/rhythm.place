#audio = playlist(reload_mode="watch", "/home/rhythm/music")
#audio = mksafe(audio)

# Define o AutoDJ como fallback, tocando músicas aleatórias de um diretório específico
autodj = playlist(reload_mode="watch", mode="random", "/home/rhythm/music")

# Configura o fallback para usar o AutoDJ em caso de falha na playlist dinâmica
radio = fallback([radio, autodj])