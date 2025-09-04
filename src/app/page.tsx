import Image from "next/image";
import { Player } from "@/comp/player";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className=""
          src="/images/logo.svg"
          alt="Rhythm Place"
          width={450}
          height={175}
          priority
        />
        <p className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          Música para todas as tribos
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Player streamUrl="https://stream.rhythm.place/main" metadataUrl="https://example.com/metadata" />
        </div>
      </main>
    </div>
  );
}
