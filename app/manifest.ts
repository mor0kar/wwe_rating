import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Squared Circle Ratings',
    short_name: 'Squared Circle',
    description: 'Bewertet WWE Shows mit Foffi, Jan, Björn & Curry',
    start_url: '/shows',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#111827',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
