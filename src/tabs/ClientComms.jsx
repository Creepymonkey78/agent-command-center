import { useState } from 'react'
import { useAI } from '../useAI.js'
import ResultBox from '../ResultBox.jsx'

const MILESTONES = [
  {
    stage: 'Pre-Contract',
    className: 'pre-contract',
    items: [
      'New lead — first contact',
      'Post-showing follow-up',
      'Cold lead re-engagement (90+ days)',
      'Price drop alert in their area',
      'Open house follow-up',
      'Listing presentation follow-up',
    ],
  },
  {
    stage: 'Under Contract',
    className: 'under-contract',
    items: [
      'Offer submitted — status update',
      'Offer accepted — next steps',
      'Inspection scheduled',
      'Inspection results summary',
      'Appraisal scheduled',
      'Appraisal results came in',
      'Appraisal came in low',
      'Contingency removed',
      'Price reduction recommendation',
      'Contract extension request',
    ],
  },
  {
    stage: 'Closing',
    className: 'closing',
    items: [
      'Clear to close',
      'Closing prep — what to bring',
    ],
  },
  {
    stage: 'Post-Close',
    className: 'post-close',
    items: [
      'Closed — congratulations!',
      'Referral thank-you',
      'Home anniversary check-in',
    ],
  },
]

export default function ClientComms() {
  const [channel, setChannel] = useState('email')
  const [milestone, setMilestone] = useState('')
  const [clientName, setClientName] = useState('')
  const [context, setContext] = useState('')
  const { result, loading, error, generate } = useAI()

  function handleGenerate() {
    if (!milestone) return
    const name = clientName.trim() || '[Client]'
    const ctx = context.trim() || 'None provided'

    let prompt
    if (channel === 'email') {
      prompt = `You are a top-producing real estate agent. Write a professional email for this transaction milestone.

Channel: Email
Milestone: ${milestone}
Client Name: ${name}
Context: ${ctx}

Include a subject line, warm greeting, body under 200 words with specific next steps, and sign off as "— [Your Name]".

Sound like a trusted advisor who is on top of every detail of this deal — not a template.`
    } else {
      prompt = `You are a top-producing real estate agent. Write a concise text message for this transaction milestone.

Channel: Text Message
Milestone: ${milestone}
Client Name: ${name}
Context: ${ctx}

Under 100 words. Warm and direct. Include next steps or a question. Sign as "— [Your Name]". No subject line.

Sound like a trusted advisor who is on top of every detail of this deal — not a template.`
    }
    generate(prompt)
  }

  return (
    <div>
      <div className="form-group">
        <div className="form-label">Channel</div>
        <div className="toggle-group">
          <button
            className={`toggle-btn${channel === 'email' ? ' active' : ''}`}
            onClick={() => setChannel('email')}
          >
            Email
          </button>
          <button
            className={`toggle-btn${channel === 'text' ? ' active' : ''}`}
            onClick={() => setChannel('text')}
          >
            Text Message
          </button>
        </div>
      </div>

      <div className="section-label">Select Milestone</div>

      {MILESTONES.map(group => (
        <div className="milestone-section" key={group.stage}>
          <div className={`milestone-stage ${group.className}`}>{group.stage}</div>
          <div className="milestone-grid">
            {group.items.map(item => (
              <button
                key={item}
                className={`milestone-btn${milestone === item ? ' selected' : ''}`}
                onClick={() => setMilestone(milestone === item ? '' : item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="section-label">Details</div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Client Name (optional)</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. John & Sarah"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
          />
        </div>
        <div className="form-group full">
          <label className="form-label">Situation Details (optional)</label>
          <textarea
            className="form-textarea"
            placeholder="e.g. Inspection found minor roof damage, ~$2,800 repair. Seller is motivated..."
            value={context}
            onChange={e => setContext(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn-primary"
        disabled={!milestone || loading}
        onClick={handleGenerate}
      >
        {channel === 'email' ? 'Generate Email' : 'Generate Text Message'}
      </button>

      <ResultBox result={result} loading={loading} error={error} />
    </div>
  )
}
