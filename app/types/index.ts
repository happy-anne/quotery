export interface User {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  sort_order?: number | null
  created_at: string
}

export interface Quote {
  id: string
  user_id: string
  title?: string
  content: string
  source?: string
  author?: string
  page?: number
  memo?: string
  category_id?: string
  category?: Category
  image_url?: string
  favorite: boolean
  created_at: string
  updated_at: string
}

export interface QuoteForm {
  title: string
  content: string
  source: string
  author: string
  page: string
  memo: string
  category_id: string
  favorite: boolean
}

export type SortOption = 'newest' | 'oldest' | 'edited'

export interface QuoteFilter {
  category_id?: string
  favorite?: boolean
  search?: string
  sort: SortOption
}
