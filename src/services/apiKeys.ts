// API Key Management Service for Supabase
export interface ApiKeyResponse {
  key_value: string
  is_active: boolean
}

export class ApiKeyService {
  private static instance: ApiKeyService
  private cachedKey: string | null = null
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private supabaseUrl: string
  private supabaseAnonKey: string

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }

  static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService()
    }
    return ApiKeyService.instance
  }

  async getOpenAIKey(): Promise<string> {
    // Check cache first
    if (this.cachedKey && Date.now() < this.cacheExpiry) {
      return this.cachedKey
    }

    // First try to get from environment variable (fallback)
    const envKey = import.meta.env.VITE_OPENAI_API_KEY
    if (envKey) {
      this.cachedKey = envKey
      this.cacheExpiry = Date.now() + this.CACHE_DURATION
      return envKey
    }

    // If no Supabase config, return empty string
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.warn('Supabase configuration not found. Using environment variable or mock content.')
      return ''
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/api-keys?key_name=openai_api_key`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.warn('Failed to fetch API key from Supabase. Using environment variable or mock content.')
        return ''
      }

      const data = await response.json()
      
      if (data.error || !data.key_value) {
        console.warn('No API key found in Supabase. Using environment variable or mock content.')
        return ''
      }

      // Cache the key
      this.cachedKey = data.key_value
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return data.key_value
    } catch (error) {
      console.error('Error fetching API key from Supabase:', error)
      return ''
    }
  }

  async setOpenAIKey(keyValue: string, description?: string): Promise<void> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.warn('Supabase configuration not found. Cannot save API key.')
      return
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key_name: 'openai_api_key',
          key_value: keyValue,
          description: description || 'OpenAI API key for content generation'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save API key')
      }

      // Clear cache to force refresh
      this.cachedKey = null
      this.cacheExpiry = 0
    } catch (error) {
      console.error('Error setting API key:', error)
      throw error
    }
  }

  async updateOpenAIKey(keyValue: string, description?: string): Promise<void> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.warn('Supabase configuration not found. Cannot update API key.')
      return
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/api-keys`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key_name: 'openai_api_key',
          key_value: keyValue,
          description: description || 'OpenAI API key for content generation'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update API key')
      }

      // Clear cache to force refresh
      this.cachedKey = null
      this.cacheExpiry = 0
    } catch (error) {
      console.error('Error updating API key:', error)
      throw error
    }
  }

  async deleteOpenAIKey(): Promise<void> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.warn('Supabase configuration not found. Cannot delete API key.')
      return
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/api-keys?key_name=openai_api_key`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete API key')
      }

      // Clear cache
      this.cachedKey = null
      this.cacheExpiry = 0
    } catch (error) {
      console.error('Error deleting API key:', error)
      throw error
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cachedKey = null
    this.cacheExpiry = 0
  }

  // Check if Supabase is configured
  isSupabaseConfigured(): boolean {
    return !!(this.supabaseUrl && this.supabaseAnonKey)
  }
}

export const apiKeyService = ApiKeyService.getInstance() 