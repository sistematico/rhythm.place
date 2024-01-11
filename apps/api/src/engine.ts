import fg from "fast-glob";

const genre = Bun.argv[2] || 'main';
const songsPath = Bun.env.SONGS_PATH;
if (!songsPath) throw new Error("SONGS_PATH not set");

function randomFile(genre: string): string {
  const scanPath = genre === 'main' ? `${songsPath}/**/*.mp3` : `${songsPath}/${genre}/**/*.mp3`
  const files = fg.globSync(scanPath, { absolute: true });
  const index = Math.round(Math.random() * (files.length - 1));
  return files[index];
}

Bun.write(Bun.stdout, randomFile(genre));
