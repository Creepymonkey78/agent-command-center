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

function InitialOfferForm({ onGenerate, loading }) {
  const [listPrice, setListPrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [buyerPosition, setBuyerPosition] = useState(BUYER_POSITIONS[1])
  const [competing, setCompeting] = useState(COMPETING_OPTIONS[0])
  const [sellerMotivation, setSellerMotivation] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [includeScript, setIncludeScript] = useState(false)

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
[2-3 paragraphs of clear, specific strategic advice. Should this buyer go above asking, at asking, or below? What contingencies should they consider waiving or keeping based on their position? What terms might make this offer stand out beyond price? Be direct and specific — this is advice for an experienced agent, not a first-time buyer education piece.]${scriptSection}

Be specific to this scenario. Reference the actual numbers provided. Write like you're coaching a fellow agent at the office, not lecturing a student.`

    onGenerate(prompt, 'Offer Advisor')
  }

  return (
    <>
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
    </>
  )
}

function CounterofferForm({ onGenerate, loading }) {
  const [originalOffer, setOriginalOffer] = useState('')
  const [counterPrice, setCounterPrice] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [termsChanged, setTermsChanged] = useState('')
  const [buyerFlexibility, setBuyerFlexibility] = useState('')
  const [buyerLeverage, setBuyerLeverage] = useState('')
  const [walkaway, setWalkaway] = useState('')

  function handleGenerate() {
    if (!counterPrice) return

    const prompt = `You are a top-producing buyer's agent and skilled negotiator with 20 years of experience in residential real estate. A seller has countered your buyer's offer and you need to advise on how to respond.

LIST PRICE: ${listPrice ? '$' + listPrice : 'Not provided'}
BUYER'S ORIGINAL OFFER: ${originalOffer ? '$' + originalOffer : 'Not provided'}
SELLER'S COUNTER PRICE: $${counterPrice}
KEY COUNTEROFFER TERMS CHANGED: ${termsChanged.trim() || 'None specified'}
BUYER'S MAX PRICE / FLEXIBILITY: ${buyerFlexibility.trim() || 'Not specified'}
BUYER'S LEVERAGE POINTS: ${buyerLeverage.trim() || 'None specified'}
WALKAWAY POINT / DEALBREAKERS: ${walkaway.trim() || 'Not specified'}

Provide the following two sections:

RESPONSE STRATEGY
[2-3 paragraphs analyzing this counteroffer. Is this counter reasonable given the list price and original offer? What is the recommended response approach — accept, counter back, or walk? What specific counter-terms should the agent propose, and why? Consider price, concessions, timeline, and any leverage points. Be direct — this is coaching for an experienced agent.]

PROFESSIONAL RESPONSE LANGUAGE
[1-2 paragraphs of ready-to-use professional language the agent can adapt when responding to the listing agent — either verbally or in a written response. Should be confident, collaborative in tone, and position the buyer favorably while advancing their interests. Sound like a seasoned agent, not a form letter.]

Be specific to the numbers provided. Reference actual dollar amounts. Write like you're coaching a fellow agent at the office.`

    onGenerate(prompt, 'Counteroffer')
  }

  return (
    <>
      <div className="section-label">Offer Figures</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">List Price</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="350,000"
              value={listPrice}
              onChange={e => setListPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Buyer's Original Offer</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="330,000"
              value={originalOffer}
              onChange={e => setOriginalOffer(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Seller's Counter Price</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="345,000"
              value={counterPrice}
              onChange={e => setCounterPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="section-label">Counteroffer Details</div>
      <div className="form-group">
        <label className="form-label">Key Counteroffer Terms Changed</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Seller rejected repair credit, moved closing date back 2 weeks, countered at $285k"
          value={termsChanged}
          onChange={e => setTermsChanged(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Buyer's Max Price / Flexibility</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Buyer can go to $280k, needs closing credit for rate buydown, flexible on close date"
          value={buyerFlexibility}
          onChange={e => setBuyerFlexibility(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Buyer's Leverage Points (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Pre-approved conventional, flexible on closing date, waived home warranty"
          value={buyerLeverage}
          onChange={e => setBuyerLeverage(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Walkaway Point / Dealbreakers (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Buyer won't go above $282k, must have inspection contingency"
          value={walkaway}
          onChange={e => setWalkaway(e.target.value)}
        />
      </div>

      <button
        className="btn-primary"
        disabled={!counterPrice || loading}
        onClick={handleGenerate}
      >
        Generate Counteroffer Response
      </button>
    </>
  )
}

export default function OfferAdvisor() {
  const [mode, setMode] = useState('initial')
  const { result, loading, error, generate, regenerate, generationId } = useAI()

  return (
    <div>
      <div className="form-group">
        <div className="form-label">Mode</div>
        <div className="toggle-group">
          <button
            className={`toggle-btn${mode === 'initial' ? ' active' : ''}`}
            onClick={() => setMode('initial')}
          >
            Initial Offer Strategy
          </button>
          <button
            className={`toggle-btn${mode === 'counteroffer' ? ' active' : ''}`}
            onClick={() => setMode('counteroffer')}
          >
            Counteroffer Response
          </button>
        </div>
      </div>

      {mode === 'initial'
        ? <InitialOfferForm onGenerate={generate} loading={loading} />
        : <CounterofferForm onGenerate={generate} loading={loading} />
      }

      <ResultBox result={result} loading={loading} error={error} generationId={generationId} onRetone={regenerate} />
    </div>
  )
}
