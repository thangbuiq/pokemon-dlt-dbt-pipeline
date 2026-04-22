'use client'

import Image from 'next/image'
import { getSpriteUrl } from '@/lib/sprites'

interface PokemonSpriteProps {
  pokemonId: number | string
  size?: number
  alt?: string
  className?: string
}

export function PokemonSprite({
  pokemonId,
  size = 96,
  alt = 'Pokemon sprite',
  className,
}: PokemonSpriteProps) {
  const src = getSpriteUrl(pokemonId)

  return <Image src={src} alt={alt} width={size} height={size} className={className} unoptimized />
}
