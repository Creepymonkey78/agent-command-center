import { useState } from 'react'

const MODEL = 'claude-sonnet-4-20250514'
const STORAGE_KEY = 'acc_api_key'

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function useAI() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate(prompt) {
    const apiKey = getApiKey()
    if (!apiKey) {
      setError('Please enter your API key in the header bar before generating.')
      return
    }
    setLoading(true)
    setResult('')
    setError('')
    try {
      let res
      try {
        res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
          }),
        })
      } catch (fetchErr) {
        if (fetchErr instanceof TypeError) {
          throw new Error(
            'Unable to reach the server. Please check your internet connection and try again.'
          )
        }
        throw fetchErr
      }

      if (!res.ok) {
        let body
        try {
          body = await res.text()
        } catch {
          body = '(could not read response body)'
        }

        if (res.status === 401) {
          throw new Error('Invalid API key. Please check the key you entered and try again.')
        }
        if (res.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
        if (res.status >= 500) {
          throw new Error('The AI service is temporarily unavailable. Please try again in a few minutes.')
        }
        throw new Error(`API error (${res.status}): ${body}`)
      }

      let data
      try {
        data = await res.json()
      } catch {
        throw new Error('Received an invalid response from the AI service. Please try again.')
      }

      const text = data.content?.[0]?.text || 'No response received.'
      setResult(text)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, generate }
}
