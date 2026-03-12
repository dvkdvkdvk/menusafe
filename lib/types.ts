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
  is_favorite?: boolean
  is_shareable?: boolean
  share_token?: string
  share_expires_at?: string
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
  completed_onboarding?: boolean
  notifications_enabled?: boolean
}

export interface Favorite {
  id: string
  user_id: string
  scan_id: string
  menu_item_name: string
  menu_item_safety: SafetyLevel
  menu_item_reason?: string
  restaurant_id?: string
  created_at: string
}

export interface UserAnalytics {
  id: string
  user_id: string
  total_scans: number
  total_safe_items: number
  total_caution_items: number
  total_unsafe_items: number
  favorite_restaurants: string[]
  most_frequent_safety_level: SafetyLevel
  last_scan_at?: string
  updated_at: string
}

export interface ScanAnalytics {
  id: string
  user_id: string
  scan_id: string
  items_analyzed: number
  safe_percentage: number
  dietary_mode_used: string
  restaurant_name?: string
  timestamp: string
}
