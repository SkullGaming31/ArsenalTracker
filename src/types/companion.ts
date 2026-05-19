export type CompanionCategory = 'robotics' | 'beasts' | 'deimos'
export type CompanionSubcategory =
  | 'Sentinel'
  | 'MOA'
  | 'Hound'
  | 'Kubrow'
  | 'Kavat'
  | 'Predasite'
  | 'Vulpaphyla'
  | string

export interface Companion {
  name: string
  /** prime, standard. */
  type: 'prime' | 'standard' | string
  /** high-level category: robotics | beasts | deimos */
  category?: CompanionCategory
  /** more specific subcategory (e.g. Sentinel, MOA, Kubrow) */
  subcategory?: CompanionSubcategory
  is_crafted?: boolean
  is_mastered?: boolean
  /** runtime/local overrides */
  crafted?: boolean
  mastered?: boolean
  parts?: petPart[]
}

export interface petPart {
  item?: string
  name?: string
  source?: string
  description?: string
  chance?: string
}
