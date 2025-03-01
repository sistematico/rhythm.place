import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/styles/main.scss'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Rhythm Place',
  description: 'O som de todas as tribos',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rhythm.place',
    siteName: 'Rhythm Place',
    title: 'Rhythm Place',
    description: 'O som de todas as tribos',
    images: [
      {
        url: 'https://rhythm.place/images/ogp.png'
      }
    ]
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // <html lang="en">
    //   <body
    //     className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    //   >
    //     {children}
    //   </body>
    // </html>
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {children}
      <div className="video-bg">
        <video autoPlay muted loop>
          <source src="https://cdn.rhythm.place/videos/4022268-hd_1920_1080_30fps.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      </div>
    </body>
  </html>
  )
}
