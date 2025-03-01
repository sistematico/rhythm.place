output.icecast(%mp3
  (bitrate=128, samplerate=44100, id3v2=true),
  host = "localhost",
  port = 8000,
  password = "hackme",
  mount = "/rtp.mp3",
  name = "Rhythm Place",
  description = "A place to dance!",
  genre = "Dance",
  icy_metadata="true",
  mksafe(radio))