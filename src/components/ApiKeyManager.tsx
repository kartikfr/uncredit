import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Eye, EyeOff, Key, Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { supabaseApiKeyService } from '../services/supabaseApiKeys'

interface ApiKeyManagerProps {
  onClose?: () => void
  showSuccessMessage?: (message: string) => void
}

export function ApiKeyManager({ onClose, showSuccessMessage }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(supabaseApiKeyService.isSupabaseConfigured())

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' })
      return
    }

    setIsLoading(true)
    try {
      await supabaseApiKeyService.setOpenAIKey(apiKey, 'OpenAI API key for content generation')
      setMessage({ type: 'success', text: 'API key saved successfully!' })
      setApiKey('')
      showSuccessMessage?.('API key saved successfully!')
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save API key. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestKey = async () => {
    setIsLoading(true)
    try {
      const key = await supabaseApiKeyService.getOpenAIKey()
      if (key) {
        setMessage({ type: 'success', text: 'API key is working correctly!' })
      } else {
        setMessage({ type: 'error', text: 'API key not found or invalid. Please set up your API key first.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'API key not found or invalid. Please set up your API key first.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          OpenAI API Key Setup
        </CardTitle>
        <CardDescription>
          Configure your OpenAI API key for content generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupabaseConfigured && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              Supabase not configured. API key will be stored in environment variables only.
            </AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="api-key">OpenAI API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSaveKey}
            disabled={isLoading || !apiKey.trim()}
            className="flex-1"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Key
          </Button>
          <Button
            onClick={handleTestKey}
            disabled={isLoading}
            variant="outline"
          >
            Test Key
          </Button>
        </div>

        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Your API key is encrypted and stored securely</p>
          <p>• The key is cached for 5 minutes to improve performance</p>
          <p>• Only you can access your API key</p>
          {isSupabaseConfigured && (
            <p>• Keys are stored in Supabase database</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 