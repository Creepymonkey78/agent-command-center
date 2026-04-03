import { useState, useEffect } from 'react'

const TONES = [
  {
    id: 'professional',
    label: 'Professional',
    modifier: '',
  },
  {
    id: 'conversational',
    label: 'Conversational',
    modifier:
      'Rewrite this in a warm, friendly, conversational tone — like a trusted friend explaining something. Keep all the same information and specific details, just change the tone and style.',
  },
  {
    id: 'direct',
    label: 'Direct & Assertive',
    modifier:
      'Rewrite this to be direct, confident, and concise. Cut the fluff, lead with action. Keep all the same information and specific details.',
  },
]

export default function ResultBox({ result, loading, error, generationId, onRetone }) {
  const [copied, setCopied] = useState(false)
  const [activeTone, setActiveTone] = useState('professional')

  // Reset tone to Professional whenever a fresh generation completes
  useEffect(() => {
    setActiveTone('professional')
  }, [generationId])

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
        Generating with AI...
      </div>
    )
  }

  if (!result && !error) return null

  const isError = !!error
  const text = error || result

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleTone(tone) {
    if (tone.id === activeTone) return
    setActiveTone(tone.id)
    if (onRetone) onRetone(tone.modifier)
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div className={`result-box${isError ? ' error' : ''}`} style={{ marginTop: 0 }}>
        <div className="result-header">
          <span className="result-label">
            {isError ? 'Error' : 'AI-Generated Result'}
          </span>
          {!isError && (
            <button className={`btn-copy${copied ? ' copied' : ''}`} onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          )}
        </div>
        <div className="result-content">{text}</div>
      </div>

      {!isError && onRetone && (
        <div className="tone-row">
          <span className="tone-label">Tone:</span>
          {TONES.map(tone => (
            <button
              key={tone.id}
              className={`tone-pill${activeTone === tone.id ? ' active' : ''}`}
              onClick={() => handleTone(tone)}
            >
              {tone.label}
            </button>
          ))}
        </div>
      )}

      {!isError && (
        <p className="ai-disclaimer">
          <span className="ai-disclaimer-icon">ℹ</span>
          AI-generated content — always review before sending.
        </p>
      )}
    </div>
  )
}
