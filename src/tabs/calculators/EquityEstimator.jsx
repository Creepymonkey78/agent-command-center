import { useState } from 'react'

function remainingBalance(principal, annualRate, termMonths, monthsElapsed) {
  const r = annualRate / 100 / 12
  if (r === 0) return Math.max(0, principal - (principal / termMonths) * monthsElapsed)
  const n = termMonths
  const k = monthsElapsed
  return principal * (Math.pow(1 + r, n) - Math.pow(1 + r, k)) / (Math.pow(1 + r, n) - 1)
}

function fmtDec(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function EquityEstimator() {
  const [homeValue, setHomeValue] = useState('')
  const [originalLoan, setOriginalLoan] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [termYears, setTermYears] = useState('30')
  const [monthsElapsed, setMonthsElapsed] = useState('')
  const [commissionRate, setCommissionRate] = useState('6')
  const [closingCosts, setClosingCosts] = useState('3000')

  const value = parseFloat(homeValue.replace(/,/g, '')) || 0
  const loan = parseFloat(originalLoan.replace(/,/g, '')) || 0
  const rate = parseFloat(interestRate) || 0
  const term = parseInt(termYears, 10) * 12
  const elapsed = parseInt(monthsElapsed, 10) || 0
  const commission = parseFloat(commissionRate) || 0
  const closing = parseFloat(closingCosts.replace(/,/g, '')) || 0

  let result = null

  if (value > 0 && loan > 0 && rate > 0 && elapsed >= 0) {
    const balance = remainingBalance(loan, rate, term, Math.min(elapsed, term))
    const equity = value - balance
    const equityPct = value > 0 ? (equity / value) * 100 : 0
    const commissionAmt = value * (commission / 100)
    const netProceeds = value - commissionAmt - closing - balance
    const totalPaid = loan - balance

    result = { balance, equity, equityPct, commissionAmt, netProceeds, totalPaid }
  }

  return (
    <div>
      <div className="section-label">Property & Loan</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Current Home Value</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="425,000"
              value={homeValue}
              onChange={e => setHomeValue(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Original Loan Amount</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="340,000"
              value={originalLoan}
              onChange={e => setOriginalLoan(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Interest Rate</label>
          <div className="pct-input-wrap">
            <input
              className="form-input"
              type="text"
              placeholder="6.75"
              value={interestRate}
              onChange={e => setInterestRate(e.target.value)}
            />
            <span className="pct-suffix">%</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Loan Term</label>
          <select className="form-select" value={termYears} onChange={e => setTermYears(e.target.value)}>
            <option value="30">30 Years</option>
            <option value="20">20 Years</option>
            <option value="15">15 Years</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Months Since Loan Originated</label>
          <input
            className="form-input"
            type="text"
            placeholder="36"
            value={monthsElapsed}
            onChange={e => setMonthsElapsed(e.target.value)}
          />
        </div>
      </div>

      <div className="section-label">Sale Costs</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Commission Rate</label>
          <div className="pct-input-wrap">
            <input
              className="form-input"
              type="text"
              placeholder="6"
              value={commissionRate}
              onChange={e => setCommissionRate(e.target.value)}
            />
            <span className="pct-suffix">%</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Estimated Closing Costs</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="3,000"
              value={closingCosts}
              onChange={e => setClosingCosts(e.target.value)}
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="net-summary">
          <h3>Equity Estimate</h3>
          <div className="summary-row">
            <span>Current Home Value</span>
            <span>{fmtDec(value)}</span>
          </div>
          <div className="summary-row">
            <span>Remaining Loan Balance</span>
            <span style={{ color: 'var(--red-600)' }}>−{fmtDec(result.balance)}</span>
          </div>
          <div className="summary-row" style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 8, fontWeight: 600, color: 'var(--gray-900)' }}>
            <span>Current Equity</span>
            <span style={{ color: result.equity >= 0 ? 'var(--green-600)' : 'var(--red-600)' }}>
              {fmtDec(result.equity)} ({result.equityPct.toFixed(1)}%)
            </span>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px solid var(--gray-200)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: 10 }}>
              If Sold Today
            </div>
            <div className="summary-row">
              <span>Sale Price</span>
              <span>{fmtDec(value)}</span>
            </div>
            <div className="summary-row">
              <span>Commission ({commissionRate}%)</span>
              <span style={{ color: 'var(--red-600)' }}>−{fmtDec(result.commissionAmt)}</span>
            </div>
            <div className="summary-row">
              <span>Closing Costs</span>
              <span style={{ color: 'var(--red-600)' }}>−{fmtDec(closing)}</span>
            </div>
            <div className="summary-row">
              <span>Loan Payoff</span>
              <span style={{ color: 'var(--red-600)' }}>−{fmtDec(result.balance)}</span>
            </div>
          </div>

          <div className={`summary-row total${result.netProceeds < 0 ? ' negative' : ''}`}>
            <span>Est. Net Proceeds</span>
            <span>{fmtDec(result.netProceeds)}</span>
          </div>

          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>
            Estimate only. Actual payoff may vary. Consult title for exact figures.
          </p>
        </div>
      )}
    </div>
  )
}
