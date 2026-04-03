import { useState } from 'react'
import { useAI } from '../useAI.js'
import ResultBox from '../ResultBox.jsx'

const OPEN_HOUSE_ITEMS = [
  'Hot lead (requested showing / very engaged)',
  'Warm lead (interested but not urgent)',
  'Neighbor / just curious',
  'Out-of-town buyer',
  'General follow-up (unclassified)',
]

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
    stage: 'Open House',
    className: 'open-house',
    items: OPEN_HOUSE_ITEMS,
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

function buildOpenHousePrompt(channel, milestone, name, ctx) {
  const channelLabel = channel === 'email' ? 'Email' : 'Text Message'

  const leadGuidance = {
    'Hot lead (requested showing / very engaged)':
      'This is a hot lead who expressed strong interest at the open house and requested a showing or was very engaged. Write with urgency — reference their excitement, lock in the next step (scheduling a private showing), and make it easy for them to say yes.',
    'Warm lead (interested but not urgent)':
      'This is a warm lead who showed genuine interest but didn\'t seem to be in a rush. Keep the tone friendly and low-pressure. Offer to answer questions, share more info about the property, and invite them to a private showing without pushing.',
    'Neighbor / just curious':
      'This person stopped by as a neighbor or just out of curiosity — they\'re probably not buying, but they know people who might be. Take a warm, community-focused angle: thank them for stopping by, mention the home\'s highlights that might interest their network, and offer to keep them posted on the local market.',
    'Out-of-town buyer':
      'This buyer is relocating or purchasing remotely. They need extra reassurance. Address the remote process directly — offer a virtual tour, explain how you can guide them through the process from afar, and emphasize your local expertise in Northwest Arkansas.',
    'General follow-up (unclassified)':
      'This is a general follow-up for a lead whose engagement level was unclear. Keep it warm and open-ended — thank them for attending, highlight a key feature of the property, and invite any questions or a follow-up conversation.',
  }

  const guidance = leadGuidance[milestone] || 'Write a warm, professional follow-up.'

  return channel === 'email'
    ? `You are a top-producing real estate agent following up after an open house. Write a professional follow-up email.

Channel: Email
Lead Type: ${milestone}
Client Name: ${name}
Context: ${ctx}

${guidance}

Include a subject line, warm greeting, body under 200 words with a specific next step, and sign off as "— [Your Name]". Sound like a real, trusted local agent — not a template.`
    : `You are a top-producing real estate agent following up after an open house. Write a concise follow-up text message.

Channel: Text Message
Lead Type: ${milestone}
Client Name: ${name}
Context: ${ctx}

${guidance}

Under 100 words. Warm and direct. End with a clear question or next step. Sign as "— [Your Name]". No subject line. Sound like a real agent, not a template.`
}

export default function ClientComms() {
  const [channel, setChannel] = useState('email')
  const [milestone, setMilestone] = useState('')
  const [milestoneGroup, setMilestoneGroup] = useState('')
  const [clientName, setClientName] = useState('')
  const [context, setContext] = useState('')
  const { result, loading, error, generate, regenerate, generationId } = useAI()

  function handleMilestoneClick(item, group) {
    const selecting = milestone !== item
    setMilestone(selecting ? item : '')
    setMilestoneGroup(selecting ? group : '')
  }

  function handleGenerate() {
    if (!milestone) return
    const name = clientName.trim() || '[Client]'
    const ctx = context.trim() || 'None provided'

    let prompt
    if (milestoneGroup === 'Open House') {
      prompt = buildOpenHousePrompt(channel, milestone, name, ctx)
    } else if (channel === 'email') {
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
    generate(prompt, 'Client Comms')
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
                onClick={() => handleMilestoneClick(item, group.stage)}
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

      <ResultBox
        result={result}
        loading={loading}
        error={error}
        generationId={generationId}
        onRetone={regenerate}
      />
    </div>
  )
}
