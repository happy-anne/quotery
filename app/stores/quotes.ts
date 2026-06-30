import { defineStore } from 'pinia'
import type { Quote, QuoteForm, QuoteFilter } from '~/types'

export const useQuotesStore = defineStore('quotes', () => {
  const { $supabase } = useNuxtApp()
  const quotes = ref<Quote[]>([])
  const loading = ref(false)
  const filter = ref<QuoteFilter>({ sort: 'newest' })

  const filteredQuotes = computed(() => {
    let list = [...quotes.value]

    if (filter.value.search) {
      const q = filter.value.search.toLowerCase()
      list = list.filter(item =>
        item.content.toLowerCase().includes(q)
        || item.title?.toLowerCase().includes(q)
        || item.source?.toLowerCase().includes(q)
        || item.author?.toLowerCase().includes(q),
      )
    }

    if (filter.value.category_id) {
      list = list.filter(item => item.category_id === filter.value.category_id)
    }

    if (filter.value.favorite) {
      list = list.filter(item => item.favorite)
    }

    switch (filter.value.sort) {
      case 'newest':
        list.sort((a, b) => b.created_at.localeCompare(a.created_at))
        break
      case 'oldest':
        list.sort((a, b) => a.created_at.localeCompare(b.created_at))
        break
      case 'title':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        break
      case 'source':
        list.sort((a, b) => (a.source || '').localeCompare(b.source || ''))
        break
    }

    return list
  })

  async function fetchQuotes() {
    loading.value = true
    const { data } = await $supabase
      .from('quotes')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })
    if (data) quotes.value = data
    loading.value = false
  }

  async function getQuote(id: string): Promise<Quote | null> {
    const local = quotes.value.find(q => q.id === id)
    if (local) return local
    const { data } = await $supabase
      .from('quotes')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single()
    return data
  }

  async function createQuote(form: QuoteForm, imageFile?: File): Promise<Quote | null> {
    let image_url: string | undefined
    if (imageFile) {
      const path = `${Date.now()}_${imageFile.name}`
      await $supabase.storage.from('quote-images').upload(path, imageFile)
      const { data: urlData } = $supabase.storage.from('quote-images').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { data: { user } } = await $supabase.auth.getUser()
    const { data } = await $supabase
      .from('quotes')
      .insert({
        user_id: user?.id,
        title: form.title || null,
        content: form.content,
        source: form.source || null,
        author: form.author || null,
        page: form.page ? Number(form.page) : null,
        memo: form.memo || null,
        category_id: form.category_id || null,
        favorite: form.favorite,
        image_url: image_url || null,
      })
      .select('*, category:categories(*)')
      .single()

    if (data) quotes.value.unshift(data)
    return data
  }

  async function updateQuote(id: string, form: Partial<QuoteForm>, imageFile?: File): Promise<void> {
    let image_url: string | undefined
    if (imageFile) {
      const path = `${Date.now()}_${imageFile.name}`
      await $supabase.storage.from('quote-images').upload(path, imageFile)
      const { data: urlData } = $supabase.storage.from('quote-images').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const updates: Record<string, unknown> = { ...form, updated_at: new Date().toISOString() }
    if (image_url) updates.image_url = image_url
    if (form.page) updates.page = Number(form.page)

    const { data } = await $supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()

    if (data) {
      const idx = quotes.value.findIndex(q => q.id === id)
      if (idx >= 0) quotes.value[idx] = data
    }
  }

  async function deleteQuote(id: string) {
    await $supabase.from('quotes').delete().eq('id', id)
    quotes.value = quotes.value.filter(q => q.id !== id)
  }

  async function toggleFavorite(id: string) {
    const quote = quotes.value.find(q => q.id === id)
    if (!quote) return
    await updateQuote(id, { favorite: !quote.favorite })
    quote.favorite = !quote.favorite
  }

  return {
    quotes,
    loading,
    filter,
    filteredQuotes,
    fetchQuotes,
    getQuote,
    createQuote,
    updateQuote,
    deleteQuote,
    toggleFavorite,
  }
})
