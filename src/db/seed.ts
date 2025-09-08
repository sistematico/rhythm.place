import { getAllFilesRecursive } from "@/lib/song";
import { db } from "@/db";
import { songs } from "@/db/schema";
import NodeID3 from "node-id3"; 

interface Tag {
  title: string;
  artist: string;
  path: string;
}

async function main() {
  const musicFiles = await getAllFilesRecursive(process.env.MUSIC_PATH!);

  for await (const song of musicFiles) {
    NodeID3.read(song as string, async (err: Error | null, tags: Tag) => {
      if (err) return null;

      let title: string;
      let artist: string;
      let path: string;
      const sep = "-"; 
           
      if (tags) {
        artist = tags.artist || song.slice(0, song.indexOf(sep));
        title = tags.title || song.slice(0, song.lastIndexOf(sep));
        path = song;
        await db.insert(songs).values({ title, artist, path }).onConflictDoNothing();
      } else {
        artist = song.slice(0, song.indexOf(sep));
        title = song.slice(0, song.lastIndexOf(sep));
        path = song;
        await db.insert(songs).values({ title, artist, path }).onConflictDoNothing();
      }
    });
  }
}

await main();