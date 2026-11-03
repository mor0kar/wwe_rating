import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Basis-Sicherheits-Header für alle Seiten: kein Einbetten in fremde Seiten
  // (Clickjacking), kein MIME-Sniffing, keine vollen URLs an fremde Seiten.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
