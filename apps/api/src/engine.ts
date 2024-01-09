import fg from "fast-glob";

const songsPath = Bun.env.SONGS_PATH;
if (!songsPath) throw new Error("SONGS_PATH not set");

function randomFile() {
  const files = fg.globSync(songsPath + "/**/*.mp3", { absolute: true });
  const index = Math.round(Math.random() * (files.length - 1));
  return files[index];
}

Bun.write(Bun.stdout, randomFile());
