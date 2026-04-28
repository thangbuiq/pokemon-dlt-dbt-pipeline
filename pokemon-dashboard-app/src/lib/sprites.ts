export const MISSING_SPRITES = new Set([10264, 10265, 10266, 10267, 10268, 10269, 10270, 10271])

export function isSpriteMissing(id: number | string): boolean {
  return MISSING_SPRITES.has(Number(id))
}

export function getSpriteUrl(id: number | string): string {
  if (isSpriteMissing(id)) {
    return '/sprites/pokemon/other/official-artwork/132.png'
  }
  return `/sprites/pokemon/other/official-artwork/${id}.png`
}
