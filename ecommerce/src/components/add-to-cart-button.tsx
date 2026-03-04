'use client'

import {Check, ShoppingBag} from 'lucide-react'
import {useState} from 'react'

import {useCart} from '@/lib/cart-context'

interface AddToCartButtonProps {
  product: {
    _id: string
    title: string
    slug: string
    price: number
    image?: string
  }
  disabled?: boolean
}

export function AddToCartButton({product, disabled}: AddToCartButtonProps) {
  const {addItem} = useCart()
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className="mt-8 flex h-14 w-full items-center justify-center gap-3 bg-neutral-900 text-sm font-medium tracking-wide text-white uppercase transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
    >
      {added ? (
        <>
          <Check className="h-5 w-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingBag className="h-5 w-5" />
          {disabled ? 'Out of Stock' : 'Add to Cart'}
        </>
      )}
    </button>
  )
}
