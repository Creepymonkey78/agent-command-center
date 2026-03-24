import { useState } from 'react'
import { useAI } from '../useAI.js'
import ResultBox from '../ResultBox.jsx'

const BUYER_POSITIONS = [
  'Cash buyer — no financing contingency',
  'Pre-approved — Conventional loan',
  'Pre-approved — FHA loan',
  'Pre-approved — VA loan',
  'Pre-approved — USDA loan',
  'Pre-qualified (not yet fully approved)',
]

const COMPETING_OPTIONS = [
  'No competing offers (that we know of)',
  '1 other offer',
  '2–3 other offers',
  '4+ offers — highly competitive',
  "Unknown — listing agent won't disclose",
]

export default function OfferAdvisor() {
  const [listPrice, setListPrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [buyerPosition, setBuyerPosition] = useState(BUYER_POSITIONS[1])
  const [competing, setCompeting] = useState(COMPETING_OPTIONS[0])
  const [sellerMotivation, setSellerMotivation] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [includeScript, setIncludeScript] = useState(false)
  const { result, loading, error, generate } = useAI()

  function handleGenerate() {
    if (!listPrice) return
    const scriptSection = includeScript
      ? `

LISTING AGENT CALL SCRIPT
[Write a short, natural phone script (under 150 words) the buyer's agent can use when calling the listing agent to present or discuss this offer. Should establish rapport, highlight the buyer's strengths, and position the offer favorably. Sound like a confident, professional agent — not a script being read.]`
      : ''

    const prompt = `You are a top-producing buyer's agent with 20 years of experience in competitive real estate markets. Based on the following details, provide a clear, actionable offer strategy.

LIST PRICE: $${listPrice}
OFFER PRICE BUYER IS CONSIDERING: ${offerPrice ? '$' + offerPrice : 'Not yet decided'}
BUYER'S FINANCIAL POSITION: ${buyerPosition}
COMPETING OFFERS: ${competing}
SELLER MOTIVATION / TIMELINE: ${sellerMotivation.trim() || 'Unknown'}
ADDITIONAL CONTEXT: ${additionalContext.trim() || 'None provided'}

Provide the following:

OFFER STRATEGY RECOMMENDATION
[2-3 paragraphs of clear, specific strategic advice. Should this buyer go above asking, at asking, or below? Should they include an escalation clause? What contingencies should they consider waiving or keeping based on their position? What terms might make this offer stand out beyond price? Be direct and specific — this is advice for an experienced agent, not a first-time buyer education piece.]

ESCALATION CLAUSE LANGUAGE (if applicable)
[If an escalation clause makes sense for this situation, provide specific suggested language the agent can adapt for their offer. Include recommended ceiling price and increment based on the scenario. If an escalation clause is NOT appropriate for this situation, explain why and what to do instead.]${scriptSection}

Be specific to this scenario. Reference the actual numbers provided. Write like you're coaching a fellow agent at the office, not lecturing a student.`

    generate(prompt)
  }

  return (
    <div>
      <div className="section-label">Property &amp; Pricing</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">List Price</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="425,000"
              value={listPrice}
              onChange={e => setListPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Offer Price Considering (optional)</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="430,000"
              value={offerPrice}
              onChange={e => setOfferPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="section-label">Buyer &amp; Competition</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Buyer's Financial Position</label>
          <select
            className="form-select"
            value={buyerPosition}
            onChange={e => setBuyerPosition(e.target.value)}
          >
            {BUYER_POSITIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Competing Offers</label>
          <select
            className="form-select"
            value={competing}
            onChange={e => setCompeting(e.target.value)}
          >
            {COMPETING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="section-label">Context</div>
      <div className="form-group">
        <label className="form-label">Seller Motivation / Timeline (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Seller relocating for work, needs to close within 30 days..."
          value={sellerMotivation}
          onChange={e => setSellerMotivation(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Additional Context (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Property has been on market for 45 days, recent price reduction..."
          value={additionalContext}
          onChange={e => setAdditionalContext(e.target.value)}
        />
      </div>

      <div className="toggle-switch-wrap">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={includeScript}
            onChange={e => setIncludeScript(e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
        <span className="toggle-switch-label">Include listing agent call script</span>
      </div>

      <button
        className="btn-primary"
        disabled={!listPrice || loading}
        onClick={handleGenerate}
      >
        Generate Offer Advice
      </button>

      <ResultBox result={result} loading={loading} error={error} />
    </div>
  )
}
