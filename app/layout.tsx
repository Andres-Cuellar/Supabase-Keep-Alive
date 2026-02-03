import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Supabase Keep-Alive Manager',
  description: 'Mantén activas tus instancias de Supabase automáticamente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
