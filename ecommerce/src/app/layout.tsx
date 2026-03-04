import './globals.css'

import {GeistMono} from 'geist/font/mono'
import {GeistPixelCircle} from 'geist/font/pixel'
import {GeistSans} from 'geist/font/sans'
import type {Metadata} from 'next'

import {CartDrawer} from '@/components/cart-drawer'
import {ChatButton} from '@/components/chat'
import {Header} from '@/components/header'
import {CartProvider} from '@/lib/cart-context'

export const metadata: Metadata = {
  title: 'Store | E-commerce Demo',
  description: 'A minimal e-commerce demo built with Next.js and Sanity',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelCircle.variable}`}
    >
      <body className="font-sans antialiased">
        <CartProvider>
          <Header />

          {children}

          <CartDrawer />

          <ChatButton />
        </CartProvider>
      </body>
    </html>
  )
}
