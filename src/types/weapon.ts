export interface Resource {
  name: string
  quantity: number
}

export interface Part {
  name: string
  count?: number
  resources?: Resource[]
  relics?: RelicDrop[]
}

export interface RelicDrop {
  relicName: string
  rarity: 'common' | 'uncommon' | 'rare'
  versions: ('intact' | 'exceptional' | 'flawless' | 'radiant')[]
}

export interface Weapon {
  name: string
  category: 'primary' | 'secondary' | 'melee'
  type: 'standard' | 'prime' | 'kuva' | 'tenet' | 'prisma' | 'vandal' | 'wraith' | 'dex' | 'nightwatch'
  is_crafted?: boolean
  is_mastered?: boolean
  parts: Part[]
  // optional persisted override shapes or marketplace info seen in data
  collected_parts?: string[]
  parts_collected?: string[]
  market?: { price?: number; method?: string; currency?: string; note?: string }
  purchase?: { price?: number; method?: string; currency?: string; note?: string }
  market_price?: number
  market_currency?: string
}

export interface MarketInfo {
  price?: number
  method?: string
  currency?: string
  note?: string
}

export interface PurchaseInfo {
  price?: number
  method?: string
  currency?: string
  note?: string
}

export type PartWithCollected = Part & { collected?: boolean }
