'use client'

import {ShoppingBag} from 'lucide-react'
import Link from 'next/link'

import {useCart} from '@/lib/cart-context'

export function Header() {
  const {totalItems, openCart} = useCart()

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Store
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/products" className="text-sm text-neutral-600 hover:text-neutral-900">
            Products
          </Link>

          <button
            type="button"
            className="relative"
            aria-label="Open cart"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />

            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center bg-neutral-900 text-[10px] text-white">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
