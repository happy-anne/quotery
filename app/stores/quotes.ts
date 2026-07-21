import { defineStore } from 'pinia'
import type { Quote, QuoteForm, QuoteFilter } from '~/types'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'avif', 'bmp', 'svg']

// Storage keys are never derived from the user's filename: uploads come from
// photo libraries and can carry spaces, Hangul, emoji, %, #, ?, [] and other
// characters that Supabase Storage rejects or that break the public URL.
// Only a whitelisted extension is kept, and the name itself is generated.
function buildImagePath(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? ''
  const fromType = file.type.split('/')[1]?.toLowerCase().replace('jpeg', 'jpg') ?? ''
  const ext = IMAGE_EXTENSIONS.includes(fromName)
    ? fromName
    : IMAGE_EXTENSIONS.includes(fromType) ? fromType : 'jpg'

  const unique = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 12)
  return `${Date.now()}_${unique}.${ext}`
}

// Reverses getPublicUrl(): pulls the storage key back out of a quote-images
// public URL so it can be handed to storage.remove().
function extractStoragePath(publicUrl: string): string | null {
  const marker = '/quote-images/'
  const i = publicUrl.indexOf(marker)
  return i === -1 ? null : publicUrl.slice(i + marker.length)
}

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
      case 'edited':
        list.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
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
    if (data) quotes.value.push(data)
    return data
  }

  // Returns undefined only when there is nothing to upload; a failed upload
  // throws so the caller never stores a URL pointing at a missing object.
  async function uploadImage(file: File): Promise<string> {
    const path = buildImagePath(file)
    const { error } = await $supabase.storage
      .from('quote-images')
      .upload(path, file, { contentType: file.type || undefined })

    if (error) {
      console.error('Failed to upload image:', error)
      throw error
    }

    const { data } = $supabase.storage.from('quote-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function createQuote(form: QuoteForm, imageFile?: File): Promise<Quote | null> {
    let image_url: string | undefined
    if (imageFile) {
      try {
        image_url = await uploadImage(imageFile)
      } catch {
        return null
      }
    }

    const { data: { user } } = await $supabase.auth.getUser()
    const { data, error } = await $supabase
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

    if (error) {
      console.error('Failed to create quote:', error)
      return null
    }

    if (data) quotes.value.unshift(data)
    return data
  }

  async function updateQuote(id: string, form: Partial<QuoteForm>, imageFile?: File): Promise<Quote | null> {
    let image_url: string | undefined
    if (imageFile) {
      try {
        image_url = await uploadImage(imageFile)
      } catch {
        return null
      }
    }

    const updates: Record<string, unknown> = {}
    if (form.title !== undefined) updates.title = form.title || null
    if (form.content !== undefined) updates.content = form.content
    if (form.source !== undefined) updates.source = form.source || null
    if (form.author !== undefined) updates.author = form.author || null
    if (form.page !== undefined) updates.page = form.page ? Number(form.page) : null
    if (form.memo !== undefined) updates.memo = form.memo || null
    if (form.category_id !== undefined) updates.category_id = form.category_id || null
    if (image_url) updates.image_url = image_url

    // Everything above is the quote's own content, so it stamps the edit time.
    // Favorite is a separate marker — starring a quote is not an edit and must
    // not show up as "최종 편집" on the detail screen.
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()
    }
    if (form.favorite !== undefined) updates.favorite = form.favorite

    const { data, error } = await $supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()

    if (error) {
      console.error('Failed to update quote:', error)
      return null
    }

    if (data) {
      const idx = quotes.value.findIndex(q => q.id === id)
      if (idx >= 0) quotes.value[idx] = data
      else quotes.value.unshift(data)
    }
    return data
  }

  async function deleteQuote(id: string) {
    await $supabase.from('quotes').delete().eq('id', id)
    quotes.value = quotes.value.filter(q => q.id !== id)
  }

  // Wipes every quote and image belonging to the current user, for account
  // deletion. Image removal is best-effort (it needs a storage delete policy
  // that may not exist yet) and never blocks the row deletion that follows.
  async function deleteAllUserData(): Promise<boolean> {
    const { data: { user } } = await $supabase.auth.getUser()
    if (!user) return false

    const { data: rows } = await $supabase
      .from('quotes')
      .select('image_url')
      .eq('user_id', user.id)

    const paths = (rows ?? [])
      .map(r => r.image_url)
      .filter((u): u is string => !!u)
      .map(extractStoragePath)
      .filter((p): p is string => !!p)

    if (paths.length) {
      const { error: storageError } = await $supabase.storage.from('quote-images').remove(paths)
      if (storageError) console.error('Failed to remove some quote images:', storageError)
    }

    const { error } = await $supabase.from('quotes').delete().eq('user_id', user.id)
    if (error) {
      console.error('Failed to delete quotes:', error)
      return false
    }

    quotes.value = []
    return true
  }

  // updateQuote already swaps the fresh row into `quotes`, so callers holding the
  // previous object should use the returned quote rather than mutating their copy.
  async function toggleFavorite(id: string): Promise<Quote | null> {
    const quote = quotes.value.find(q => q.id === id)
    if (!quote) return null
    return updateQuote(id, { favorite: !quote.favorite })
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
    deleteAllUserData,
    toggleFavorite,
  }
})
