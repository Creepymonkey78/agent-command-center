import { useState } from 'react'

const API_URL = 'https://api.anthropic.com/v1/messages'
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
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`API error (${res.status}): ${body}`)
      }
      const data = await res.json()
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
