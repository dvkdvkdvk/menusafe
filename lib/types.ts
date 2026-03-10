export type SafetyLevel = "safe" | "caution" | "unsafe"

export interface MenuItem {
  name: string
  safety: SafetyLevel
  reason: string
  ingredients_of_concern: string[]
}

export interface ScanResult {
  id: string
  user_id: string
  restaurant_id: string | null
  menu_items: MenuItem[]
  raw_text: string | null
  dietary_mode: string
  created_at: string
  restaurants?: {
    id: string
    name: string
    address: string | null
  } | null
}

export interface Profile {
  id: string
  display_name: string | null
  dietary_mode: "strict" | "mild"
  gluten_free: boolean
  lactose_free: boolean
  created_at: string
  updated_at: string
}
