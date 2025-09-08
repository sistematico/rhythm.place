import { getRandomFile } from "@/lib/song";

const musicPath = process.env.MUSIC_PATH!;

export async function GET() {
  const song = await getRandomFile(musicPath);
  return new Response(song, {
    status: 200,
    headers: { "Content-Type": "text/plain" }
  });
}

export async function POST(request: Request) {
  // Parse the request body
  const body = await request.json();
  const { name } = body;

  // e.g. Insert new user into your DB
  const newUser = { id: Date.now(), name };

  return new Response(JSON.stringify(newUser), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}