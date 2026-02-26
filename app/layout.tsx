import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import ApiKeyGate from '@/components/ApiKeyGate'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Proposal Agent — Lumenalta',
  description: 'AI-powered sales proposal generator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased bg-[#0F1117] text-white min-h-screen`}>
        <ApiKeyGate>{children}</ApiKeyGate>
      </body>
    </html>
  )
}
