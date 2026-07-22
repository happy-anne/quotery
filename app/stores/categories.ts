import { defineStore } from 'pinia'
import type { Category } from '~/types'

const DEFAULT_COLORS = ['#e8d5c4', '#c4d5e8', '#c4e8d5', '#e8c4d5', '#d5e8c4', '#e8e4c4']

export const useCategoriesStore = defineStore('categories', () => {
  const { $supabase } = useNuxtApp()
  const categories = ref<Category[]>([])
  const loading = ref(false)

  // Manual order first; rows that predate sort_order fall back to creation order.
  async function fetchCategories() {
    loading.value = true
    const { data } = await $supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    if (data) categories.value = data
    loading.value = false
  }

  // Returns null on failure so callers can surface it — the inline picker on the
  // write screen needs to tell the user rather than silently doing nothing.
  async function createCategory(name: string, color?: string): Promise<Category | null> {
    const usedColors = categories.value.map(c => c.color)
    const nextColor = color || DEFAULT_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_COLORS[0]
    const { data: { user } } = await $supabase.auth.getUser()
    const { data, error } = await $supabase
      .from('categories')
      .insert({ name, color: nextColor, user_id: user?.id })
      .select()
      .single()

    if (error) {
      console.error('Failed to create category:', error)
      return null
    }

    if (data) categories.value.push(data)
    return data
  }

  // Applies `ordered` locally first so the list doesn't flicker, then persists
  // every position in one upsert. Restores the previous order if it fails.
  //
  // The rows are written back whole: an upsert needs the not-null columns, and
  // a PATCH that matches no rows reports success, so the returned row count is
  // what actually proves the write landed.
  async function reorderCategories(ordered: Category[]) {
    const previous = categories.value
    categories.value = ordered.map((c, i) => ({ ...c, sort_order: i }))

    const { data: { user } } = await $supabase.auth.getUser()
    if (!user) {
      categories.value = previous
      return { ok: false, message: '로그인이 필요합니다.' }
    }

    const rows = ordered.map((c, i) => ({
      id: c.id,
      user_id: c.user_id ?? user.id,
      name: c.name,
      color: c.color,
      sort_order: i,
    }))

    const { data, error } = await $supabase
      .from('categories')
      .upsert(rows, { onConflict: 'id' })
      .select('id')

    if (error) {
      console.error('Failed to save category order:', error)
      categories.value = previous
      return { ok: false, message: `순서 저장 실패: ${error.message}` }
    }

    if (!data || data.length !== rows.length) {
      console.error('Category order write affected', data?.length ?? 0, 'of', rows.length, 'rows')
      categories.value = previous
      return { ok: false, message: '순서가 저장되지 않았어요. 권한을 확인해주세요.' }
    }

    return { ok: true, message: '' }
  }

  async function deleteCategory(id: string) {
    await $supabase.from('categories').delete().eq('id', id)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  async function deleteAllUserData(): Promise<boolean> {
    const { data: { user } } = await $supabase.auth.getUser()
    if (!user) return false
    const { error } = await $supabase.from('categories').delete().eq('user_id', user.id)
    if (error) {
      console.error('Failed to delete categories:', error)
      return false
    }
    categories.value = []
    return true
  }

  function getCategoryById(id: string) {
    return categories.value.find(c => c.id === id)
  }

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    deleteCategory,
    deleteAllUserData,
    reorderCategories,
    getCategoryById,
  }
})
