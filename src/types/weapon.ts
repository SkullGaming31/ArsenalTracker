export interface Resource {
  name: string
  quantity: number
  collected: boolean
}

export interface Part {
  name: string
  collected: boolean
  resources: Resource[]
}

export interface Weapon {
  name: string
  category: 'primary' | 'secondary' | 'melee'
  type: 'prime' | 'standard' | 'kuva' | 'tenet'
  is_crafted?: boolean
  is_mastered?: boolean
  parts: Part[]
  main_blueprint_resources?: Resource[]
}
