import Image from 'next/image'
import Player from '@/components/player'
import Search from '@/components/search'

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="w-full max-w-xl h-auto"
          src="/images/logo.svg"
          alt={process.env.NEXT_PUBLIC_APP_NAME!}
          width={180}
          height={38}
          priority
        />
        <div className="flex w-full justify-center">
          <Player />
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Search />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME!}
      </footer>
    </div>
  )
}
