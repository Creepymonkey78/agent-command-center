import { useState } from 'react'

function monthlyPayment(principal, annualRate, termMonths) {
  const r = annualRate / 100 / 12
  if (r === 0) return principal / termMonths
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1)
}

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function fmtDec(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BuydownCalculator() {
  const [loanAmount, setLoanAmount] = useState('')
  const [noteRate, setNoteRate] = useState('')
  const [termYears, setTermYears] = useState('30')
  const [buydownType, setBuydownType] = useState('2-1')
  const [points, setPoints] = useState('1')

  const loan = parseFloat(loanAmount.replace(/,/g, '')) || 0
  const rate = parseFloat(noteRate) || 0
  const term = parseInt(termYears, 10) * 12

  let result = null

  if (loan > 0 && rate > 0 && term > 0) {
    const fullPmt = monthlyPayment(loan, rate, term)

    if (buydownType === '2-1') {
      const y1Pmt = monthlyPayment(loan, rate - 2, term)
      const y2Pmt = monthlyPayment(loan, rate - 1, term)
      const subsidy = (fullPmt - y1Pmt) * 12 + (fullPmt - y2Pmt) * 12
      result = {
        type: '2-1 Buydown',
        rows: [
          { label: 'Year 1 Rate', value: `${(rate - 2).toFixed(3)}%`, sub: `Payment: ${fmtDec(y1Pmt)}/mo` },
          { label: 'Year 2 Rate', value: `${(rate - 1).toFixed(3)}%`, sub: `Payment: ${fmtDec(y2Pmt)}/mo` },
          { label: 'Year 3+ Rate', value: `${rate.toFixed(3)}%`, sub: `Payment: ${fmtDec(fullPmt)}/mo` },
        ],
        highlight: { label: 'Total Buydown Subsidy Cost', value: fmtDec(subsidy) },
        note: 'Subsidy is typically paid by the seller or builder as a concession.',
      }
    } else if (buydownType === '1-0') {
      const y1Pmt = monthlyPayment(loan, rate - 1, term)
      const subsidy = (fullPmt - y1Pmt) * 12
      result = {
        type: '1-0 Buydown',
        rows: [
          { label: 'Year 1 Rate', value: `${(rate - 1).toFixed(3)}%`, sub: `Payment: ${fmtDec(y1Pmt)}/mo` },
          { label: 'Year 2+ Rate', value: `${rate.toFixed(3)}%`, sub: `Payment: ${fmtDec(fullPmt)}/mo` },
        ],
        highlight: { label: 'Total Buydown Subsidy Cost', value: fmtDec(subsidy) },
        note: 'Subsidy is typically paid by the seller or builder as a concession.',
      }
    } else {
      const pts = parseFloat(points) || 0
      const newRate = rate - pts * 0.25
      const newPmt = monthlyPayment(loan, newRate, term)
      const upfrontCost = (pts / 100) * loan
      const monthlySavings = fullPmt - newPmt
      const breakEvenMonths = monthlySavings > 0 ? Math.ceil(upfrontCost / monthlySavings) : null
      result = {
        type: 'Permanent Rate Buydown',
        rows: [
          { label: 'Note Rate (no points)', value: `${rate.toFixed(3)}%`, sub: `Payment: ${fmtDec(fullPmt)}/mo` },
          { label: `Bought-Down Rate (${pts} pts)`, value: `${newRate.toFixed(3)}%`, sub: `Payment: ${fmtDec(newPmt)}/mo` },
          { label: 'Upfront Points Cost', value: fmtDec(upfrontCost), sub: `${pts} point${pts !== '1' ? 's' : ''} × loan amount` },
          { label: 'Monthly Savings', value: fmtDec(monthlySavings), sub: 'Per month vs. no points' },
        ],
        highlight: {
          label: 'Break-Even Point',
          value: breakEvenMonths ? `${breakEvenMonths} months (${(breakEvenMonths / 12).toFixed(1)} yrs)` : 'N/A',
        },
        note: 'Each discount point = 1% of loan amount and typically reduces rate by ~0.25%.',
      }
    }
  }

  return (
    <div>
      <div className="section-label">Loan Details</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Loan Amount</label>
          <div className="dollar-input-wrap">
            <span className="dollar-prefix">$</span>
            <input
              className="form-input"
              type="text"
              placeholder="350,000"
              value={loanAmount}
              onChange={e => setLoanAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Note Rate (full rate)</label>
          <div className="pct-input-wrap">
            <input
              className="form-input"
              type="text"
              placeholder="7.25"
              value={noteRate}
              onChange={e => setNoteRate(e.target.value)}
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
      </div>

      <div className="section-label">Buydown Type</div>
      <div className="toggle-group" style={{ marginBottom: 16 }}>
        {[['2-1', '2-1 Buydown'], ['1-0', '1-0 Buydown'], ['permanent', 'Permanent (Points)']].map(([id, label]) => (
          <button
            key={id}
            className={`toggle-btn${buydownType === id ? ' active' : ''}`}
            onClick={() => setBuydownType(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {buydownType === 'permanent' && (
        <div className="form-group" style={{ maxWidth: 220 }}>
          <label className="form-label">Discount Points</label>
          <div className="pct-input-wrap">
            <input
              className="form-input"
              type="text"
              placeholder="1"
              value={points}
              onChange={e => setPoints(e.target.value)}
            />
            <span className="pct-suffix">pts</span>
          </div>
        </div>
      )}

      {result && (
        <div className="net-summary">
          <h3>{result.type}</h3>
          {result.rows.map(row => (
            <div key={row.label} className="summary-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, paddingBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{row.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{row.value}</span>
              </div>
              {row.sub && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{row.sub}</span>}
            </div>
          ))}
          <div className="summary-row total" style={{ color: 'var(--blue)' }}>
            <span>{result.highlight.label}</span>
            <span>{result.highlight.value}</span>
          </div>
          {result.note && (
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>{result.note}</p>
          )}
        </div>
      )}
    </div>
  )
}
