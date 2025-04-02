import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Scarlet Reverie | Progressive Rock Band',
  description: 'A female-fronted progressive rock band from Toronto, blending strength and softness with ferocity and passion.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  )
} 