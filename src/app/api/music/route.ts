import { db } from "@/db";
import { requests, songs, history } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // Busca o request mais antigo
  const req = await db.select().from(requests).orderBy(requests.id).limit(1);
  let song: typeof songs.$inferSelect | undefined;
  if (req.length > 0) {
    // Tem pedido, busca a música correspondente
    const songReq = await db
      .select()
      .from(songs)
      .where(eq(songs.id, req[0].songId))
      .limit(1);
    song = songReq[0];
    // Registra na history
    await db.insert(history).values({ songId: song.id });
    // Apaga o request lido
    await db.delete(requests).where(eq(requests.id, req[0].id));
  } else {
    // Não tem pedido, busca música aleatória
    const allSongs = await db.select().from(songs);
    if (allSongs.length === 0) {
      return new Response("", { status: 404 });
    }
    const randomIndex = Math.floor(Math.random() * allSongs.length);
    song = allSongs[randomIndex];
    // Registra na history
    await db.insert(history).values({ songId: song.id });
  }
  // Retorna apenas o path da música
  return new Response(song.path, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
