import { defineStore } from 'pinia'
import type { Category } from '~/types'

const DEFAULT_COLORS = ['#e8d5c4', '#c4d5e8', '#c4e8d5', '#e8c4d5', '#d5e8c4', '#e8e4c4']

export const useCategoriesStore = defineStore('categories', () => {
  const { $supabase } = useNuxtApp()
  const categories = ref<Category[]>([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    const { data } = await $supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) categories.value = data
    loading.value = false
  }

  async function createCategory(name: string, color?: string) {
    const usedColors = categories.value.map(c => c.color)
    const nextColor = color || DEFAULT_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_COLORS[0]
    const { data: { user } } = await $supabase.auth.getUser()
    const { data } = await $supabase
      .from('categories')
      .insert({ name, color: nextColor, user_id: user?.id })
      .select()
      .single()
    if (data) categories.value.push(data)
    return data
  }

  async function deleteCategory(id: string) {
    await $supabase.from('categories').delete().eq('id', id)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  function getCategoryById(id: string) {
    return categories.value.find(c => c.id === id)
  }

  return { categories, loading, fetchCategories, createCategory, deleteCategory, getCategoryById }
})
