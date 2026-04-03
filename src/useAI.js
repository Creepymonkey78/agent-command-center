import { useState, useRef } from 'react'
import { trackUsage } from './useTracking.js'

const MODEL = 'claude-sonnet-4-20250514'

export function useAI() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generationId, setGenerationId] = useState(0)
  const lastPromptRef = useRef('')

  async function fetchResult(prompt) {
    setLoading(true)
    setResult('')
    setError('')
    try {
      let res
      try {
        res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        try { body = await res.text() } catch { body = '(could not read response body)' }
        if (res.status === 401) throw new Error('Invalid API key. Please contact your administrator.')
        if (res.status === 429) throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        if (res.status >= 500) throw new Error('The AI service is temporarily unavailable. Please try again in a few minutes.')
        throw new Error(`API error (${res.status}): ${body}`)
      }

      let data
      try { data = await res.json() } catch {
        throw new Error('Received an invalid response from the AI service. Please try again.')
      }

      setResult(data.content?.[0]?.text || 'No response received.')
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function generate(prompt, feature = '') {
    if (feature) trackUsage(feature)
    lastPromptRef.current = prompt
    setGenerationId(id => id + 1)
    await fetchResult(prompt)
  }

  // Rerun with a tone modifier appended to the last prompt (does not re-track usage)
  async function regenerate(toneModifier) {
    if (!lastPromptRef.current) return
    const prompt = toneModifier
      ? lastPromptRef.current + '\n\n' + toneModifier
      : lastPromptRef.current
    await fetchResult(prompt)
  }

  return { result, loading, error, generate, regenerate, generationId }
}
