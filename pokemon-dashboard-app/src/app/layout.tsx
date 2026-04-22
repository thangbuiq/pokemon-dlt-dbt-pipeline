import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { DuckDBProvider } from './DuckDBProvider'
import { Layout } from '@/components/layout/Layout'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cyberpunk Pokédex',
  description: 'Cyberpunk-themed Pokémon data dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <DuckDBProvider>
          <Layout>{children}</Layout>
        </DuckDBProvider>
      </body>
    </html>
  )
}
