export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse bg-neutral-200" />
        <div className="h-4 w-3 animate-pulse bg-neutral-200" />
        <div className="h-4 w-20 animate-pulse bg-neutral-200" />
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        {/* Image skeleton */}
        <div className="aspect-[3/4] animate-pulse bg-neutral-200" />

        {/* Details skeleton */}
        <div className="flex flex-col">
          {/* Brand / Category */}
          <div className="h-4 w-32 animate-pulse bg-neutral-200" />

          {/* Title */}
          <div className="mt-3 h-9 w-3/4 animate-pulse bg-neutral-200" />

          {/* Price */}
          <div className="mt-4 h-7 w-24 animate-pulse bg-neutral-200" />

          {/* Description */}
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full animate-pulse bg-neutral-200" />
            <div className="h-4 w-5/6 animate-pulse bg-neutral-200" />
            <div className="h-4 w-2/3 animate-pulse bg-neutral-200" />
          </div>

          {/* Add to cart button */}
          <div className="mt-8 h-12 w-full animate-pulse bg-neutral-200" />

          {/* Features */}
          <div className="mt-10 border-t border-neutral-200 pt-6">
            <div className="h-4 w-20 animate-pulse bg-neutral-200" />

            <div className="mt-3 space-y-2">
              <div className="h-4 w-3/4 animate-pulse bg-neutral-200" />
              <div className="h-4 w-1/2 animate-pulse bg-neutral-200" />
              <div className="h-4 w-2/3 animate-pulse bg-neutral-200" />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <div className="h-4 w-12 animate-pulse bg-neutral-200" />

            <div className="mt-3 flex gap-2">
              <div className="h-7 w-16 animate-pulse bg-neutral-200" />
              <div className="h-7 w-20 animate-pulse bg-neutral-200" />
              <div className="h-7 w-14 animate-pulse bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
