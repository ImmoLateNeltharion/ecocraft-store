import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/currency'

export interface ProductCardProps {
  slug: string
  title: string
  subtitle?: string | null
  price: number
  image: string
  material?: string
}

export default function ProductCard(props: ProductCardProps) {
  return (
    <Link 
      href={`/product/${props.slug}`} 
      className="card overflow-hidden block group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-sand/20">
        <Image 
          src={props.image} 
          alt={props.title} 
          fill 
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" 
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <div className="p-5 space-y-2">
        <h3 className="font-medium text-lg text-graphite group-hover:text-moss transition-colors duration-300">
          {props.title}
        </h3>
        {props.subtitle && (
          <p className="text-sm text-graphite/60">{props.subtitle}</p>
        )}
        {props.material && (
          <div className="inline-block">
            <span className="badge text-xs">{props.material}</span>
          </div>
        )}
        <div className="pt-2 font-semibold text-lg text-moss flex items-center justify-between">
          <span>{formatPrice(props.price)}</span>
          <svg 
            className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

