import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: 
     [
      { protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is2-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is3-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is4-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'is5-ssl.mzstatic.com' },
      { protocol: 'https', hostname: 'lastfm.freetls.fastly.net' },
      { protocol: 'https', hostname: 'i.scdn.co' } // Para o Spotify, caso você adicione essa API no futuro
    ],
  }
}

export default nextConfig;
