import { useState } from 'react'
import { useAI } from '../useAI.js'
import ResultBox from '../ResultBox.jsx'

const POST_TYPES = [
  'Just Listed',
  'Just Sold',
  'Coming Soon',
  'Market Update',
  'Agent Branding',
]

const TONES = [
  'Professional',
  'Casual/Fun',
  'Luxury',
  'Community-Focused',
]

// These post types don't need a property address
const NO_ADDRESS_TYPES = ['Market Update', 'Agent Branding']

export default function SocialMedia() {
  const [postType, setPostType] = useState('Just Listed')
  const [platform, setPlatform] = useState('facebook')
  const [address, setAddress] = useState('')
  const [highlights, setHighlights] = useState('')
  const [tone, setTone] = useState('Professional')
  const [additionalContext, setAdditionalContext] = useState('')
  const { result, loading, error, generate } = useAI()

  const showAddress = !NO_ADDRESS_TYPES.includes(postType)

  function handleGenerate() {
    const platformLabel = platform === 'facebook' ? 'Facebook' : 'Instagram'
    const addressLine = showAddress && address.trim()
      ? `PROPERTY ADDRESS: ${address.trim()}`
      : ''
    const highlightsLine = highlights.trim()
      ? `KEY HIGHLIGHTS: ${highlights.trim()}`
      : 'KEY HIGHLIGHTS: None provided'
    const contextLine = additionalContext.trim()
      ? `ADDITIONAL CONTEXT: ${additionalContext.trim()}`
      : 'ADDITIONAL CONTEXT: None provided'

    const platformInstructions = platform === 'facebook'
      ? `Write a Facebook post. 2–4 short paragraphs. Conversational and engaging — Facebook allows a bit more storytelling than Instagram. No hashtag block needed, though 1–3 natural hashtags inline are fine if they fit. End with a clear call to action.`
      : `Write an Instagram caption. Keep the caption punchy and visual — under 150 words. Hook the reader in the first line since it gets cut off. End with a call to action. Then on a new line add "." and then a line of 15–20 relevant hashtags (mix of broad real estate tags and Northwest Arkansas / local tags).`

    const prompt = `You are a top-producing real estate agent with a strong social media presence in Northwest Arkansas. Write a ${platformLabel} post for the following scenario.

POST TYPE: ${postType}
PLATFORM: ${platformLabel}
${addressLine}
${highlightsLine}
TONE: ${tone}
${contextLine}

${platformInstructions}

Important guidelines:
- Sound like a real agent who lives and works in this community — specific, warm, and human
- Do NOT use generic phrases like "dream home," "your forever home," "nestled," or "boasting"
- Do not sound like AI-generated marketing copy — write like a person, not a brand
- Match the tone specified: ${tone}
- All posts should be ready to copy and paste — no placeholders except for the agent signature

Sign off naturally as a local agent (e.g., "Questions? Shoot me a message!" or "DM me for details." or "— [Your Name]").`

    generate(prompt, 'Social Media')
  }

  return (
    <div>
      <div className="section-label">Post Details</div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Post Type</label>
          <select
            className="form-select"
            value={postType}
            onChange={e => setPostType(e.target.value)}
          >
            {POST_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Tone</label>
          <select
            className="form-select"
            value={tone}
            onChange={e => setTone(e.target.value)}
          >
            {TONES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <div className="form-label">Platform</div>
        <div className="toggle-group">
          <button
            className={`toggle-btn${platform === 'facebook' ? ' active' : ''}`}
            onClick={() => setPlatform('facebook')}
          >
            Facebook
          </button>
          <button
            className={`toggle-btn${platform === 'instagram' ? ' active' : ''}`}
            onClick={() => setPlatform('instagram')}
          >
            Instagram
          </button>
        </div>
      </div>

      {showAddress && (
        <div className="form-group">
          <label className="form-label">Property Address (optional)</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. 412 Oak Ridge Dr, Bentonville, AR 72712"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>
      )}

      <div className="section-label">Content</div>

      <div className="form-group">
        <label className="form-label">Key Highlights (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. 4 bed/3 bath, huge backyard, new roof, walking distance to schools..."
          value={highlights}
          onChange={e => setHighlights(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Additional Context (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Sold in 3 days over asking — great story to tell. Buyers were relocating from Dallas."
          value={additionalContext}
          onChange={e => setAdditionalContext(e.target.value)}
        />
      </div>

      <button
        className="btn-primary"
        disabled={loading}
        onClick={handleGenerate}
      >
        Generate {platform === 'facebook' ? 'Facebook' : 'Instagram'} Post
      </button>

      <ResultBox result={result} loading={loading} error={error} />
    </div>
  )
}
