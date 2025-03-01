output.icecast(
  %mp3(bitrate=128, samplerate=44100, stereo=true, id3v2=true),
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