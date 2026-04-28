import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { Layout } from '@/components/layout/Layout'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'pokeXgen',
  description: 'The next-gen Pokédex for exploring Pokémon data, matchups, and team strategy.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  )
}
