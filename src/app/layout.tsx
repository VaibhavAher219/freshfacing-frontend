import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FreshFacing — A New Website in an Hour',
  description: 'Modern, fast websites for small local businesses. $20/month.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Newsreader:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
