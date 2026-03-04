'use client'

import {Minus, Plus, ShoppingBag, X} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {useEffect, useState} from 'react'

import {useCart} from '@/lib/cart-context'
import {formatPrice} from '@/lib/utils'

export function CartDrawer() {
  const {items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice, clearCart} =
    useCart()

  // Controls the CSS transition state (separate from mount state)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Mount first, then trigger transition on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    } else {
      setVisible(false)
    }
  }, [isOpen])

  // Keep mounted during exit animation
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
    }
  }, [isOpen])

  const handleTransitionEnd = () => {
    if (!isOpen) setMounted(false)
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        onTransitionEnd={handleTransitionEnd}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />

            <h2 className="text-lg font-semibold">Cart ({totalItems})</h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-400">
              <ShoppingBag className="h-12 w-12" />

              <p className="text-sm">Your cart is empty</p>

              <button
                type="button"
                onClick={closeCart}
                className="mt-2 border border-neutral-900 px-6 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {items.map((item) => (
                <li key={item._id} className="flex gap-4 px-6 py-4">
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-20 w-20 shrink-0 overflow-hidden bg-neutral-100"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        No img
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.title}
                      </Link>

                      <p className="mt-0.5 text-sm text-neutral-500">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <span className="flex h-8 w-8 items-center justify-center border-x border-neutral-200 text-xs font-medium">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeItem(item._id)}
                        className="text-xs text-neutral-400 transition-colors hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Subtotal</span>

              <span className="text-lg font-semibold">{formatPrice(totalPrice)}</span>
            </div>

            <p className="mt-1 text-xs text-neutral-400">
              Shipping and taxes calculated at checkout.
            </p>

            <button
              type="button"
              className="mt-4 flex h-12 w-full items-center justify-center bg-neutral-900 text-sm font-medium tracking-wide text-white uppercase transition-colors hover:bg-neutral-800"
            >
              Checkout
            </button>

            <button
              type="button"
              onClick={clearCart}
              className="mt-2 w-full py-2 text-center text-xs text-neutral-400 transition-colors hover:text-neutral-600"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
