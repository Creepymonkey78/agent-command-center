import { useState } from 'react'

export default function ResultBox({ result, loading, error }) {
  const [copied, setCopied] = useState(false)

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

  return (
    <div className={`result-box${isError ? ' error' : ''}`}>
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
  )
}
