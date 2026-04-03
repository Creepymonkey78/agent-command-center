import { useState } from 'react'
import { useAI } from '../useAI.js'
import ResultBox from '../ResultBox.jsx'

const CONDITIONS = [
  'Move-in ready — updated and shows well',
  'Average — clean but not recently updated',
  'Below average — needs cosmetic work',
  'Needs significant repairs / renovation',
]

const MARKETS = [
  'Hot — homes selling fast, multiple offers common',
  'Warm — steady demand, reasonable days on market',
  'Balanced — neither favoring buyers nor sellers',
  'Cool — longer days on market, price reductions common',
  "Cold — very slow, heavy buyer's market",
]

const SELLER_EXPECTATIONS = [
  'Realistic — open to market-based pricing',
  'Slightly high — wants 5-10% above comps',
  'Significantly high — wants 15%+ above comps',
  'Unsure — needs guidance on where to price',
]

const CHALLENGES = [
  'No major challenges',
  'Outdated kitchen or bathrooms',
  'Busy road or noise concerns',
  'Deferred maintenance',
  'Unusual layout or floor plan',
  'Small lot or no yard',
  'HOA restrictions or high dues',
  'Previous price reductions (relisted)',
  'Stigmatized property (death, flooding, etc.)',
]

export default function ListingAdvisor() {
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState(CONDITIONS[0])
  const [market, setMarket] = useState(MARKETS[1])
  const [sellerExp, setSellerExp] = useState(SELLER_EXPECTATIONS[0])
  const [challenges, setChallenges] = useState([])
  const [notes, setNotes] = useState('')
  const { result, loading, error, generate, regenerate, generationId } = useAI()

  function toggleChallenge(c) {
    if (c === 'No major challenges') {
      setChallenges(prev => prev.includes(c) ? [] : [c])
      return
    }
    setChallenges(prev => {
      const without = prev.filter(x => x !== 'No major challenges')
      return without.includes(c) ? without.filter(x => x !== c) : [...without, c]
    })
  }

  function handleGenerate() {
    const challengeStr = challenges.length === 0
      ? 'No major challenges'
      : challenges.join('; ')

    const prompt = `You are a seasoned listing agent with 20 years of experience preparing for a listing appointment. Based on the following details, generate a persuasive pricing narrative and seller consultation strategy.

PROPERTY: ${address.trim() || 'Address not provided'}
SUGGESTED LIST PRICE: ${price ? '$' + price : 'To be determined'}
PROPERTY CONDITION: ${condition}
LOCAL MARKET CONDITIONS: ${market}
SELLER'S PRICE EXPECTATIONS: ${sellerExp}
PROPERTY CHALLENGES: ${challengeStr}
ADDITIONAL CONTEXT: ${notes.trim() || 'None provided'}

Provide the following:

PRICING NARRATIVE
[2-3 paragraphs of persuasive, conversational language the agent can use to explain and justify their recommended price to the seller. This should feel like coaching — give the agent the actual words to say at the kitchen table. Reference the property condition and market conditions. If the seller's expectations are high, address that directly but diplomatically.]

COMPETITIVE POSITIONING
[3-4 specific, actionable recommendations for how to position this listing to sell. Think staging advice, pricing psychology, timing, marketing angle — based on the condition and market temperature provided.]

SELLER OBJECTION RESPONSES
[Provide natural, confident responses to these common objections:
- "My neighbor's house sold for more"
- "Zillow / an online estimate says it's worth more"
- "I'm not in a rush, I'll just wait for my price"
- "I want to start high and come down if needed"]

Write like you're coaching a fellow agent at the office — direct, specific, and practical. No fluff.`

    generate(prompt, 'Listing Advisor')
  }

  return (
    <div>
      <div className="section-label">Property</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Property Address</label>
          <input
            className="form-input"
            type="text"
            placeholder="123 Main St, City, State"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Your Suggested List Price</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="350,000"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group full">
          <label className="form-label">Property Condition</label>
          <select
            className="form-select"
            value={condition}
            onChange={e => setCondition(e.target.value)}
          >
            {CONDITIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="section-label">Market &amp; Seller</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Local Market Temperature</label>
          <select
            className="form-select"
            value={market}
            onChange={e => setMarket(e.target.value)}
          >
            {MARKETS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Seller's Price Expectations</label>
          <select
            className="form-select"
            value={sellerExp}
            onChange={e => setSellerExp(e.target.value)}
          >
            {SELLER_EXPECTATIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="form-group full">
          <label className="form-label">Property Challenges</label>
          <div className="chips-wrap">
            {CHALLENGES.map(c => (
              <button
                key={c}
                className={`chip${challenges.includes(c) ? ' selected' : ''}`}
                onClick={() => toggleChallenge(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Additional Notes (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Seller is downsizing, needs to sell within 60 days, home backs to golf course..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <button
        className="btn-primary"
        disabled={loading}
        onClick={handleGenerate}
      >
        Generate Listing Advice
      </button>

      <ResultBox result={result} loading={loading} error={error} generationId={generationId} onRetone={regenerate} />
    </div>
  )
}
