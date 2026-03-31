import { useState, useMemo } from 'react'

function num(v) {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function DollarInput({ label, value, onChange, placeholder, note }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="dollar-input-wrap">
        <span className="dollar-prefix">$</span>
        <input
          className="form-input"
          type="text"
          placeholder={placeholder || '0'}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      {note && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{note}</div>}
    </div>
  )
}

function PctInput({ label, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="pct-input-wrap">
        <input
          className="form-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <span className="pct-suffix">%</span>
      </div>
    </div>
  )
}

export default function MortgageEstimator() {
  const [purchasePrice, setPurchasePrice] = useState('')
  const [downPct, setDownPct] = useState('20')
  const [rate, setRate] = useState('6.5')
  const [term, setTerm] = useState('30')
  const [annualTax, setAnnualTax] = useState('')
  const [annualInsurance, setAnnualInsurance] = useState('1200')
  const [monthlyHOA, setMonthlyHOA] = useState('0')
  const [monthlyPMI, setMonthlyPMI] = useState('0')

  const calc = useMemo(() => {
    const price = num(purchasePrice)
    if (price <= 0) return null
    const down = price * (num(downPct) / 100)
    const loan = price - down
    const r = (num(rate) / 100) / 12
    const n = num(term) * 12
    let pi = 0
    if (r === 0) {
      pi = n > 0 ? loan / n : 0
    } else {
      pi = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    }
    const monthlyTax = num(annualTax) / 12
    const monthlyIns = num(annualInsurance) / 12
    const hoa = num(monthlyHOA)
    const pmi = num(monthlyPMI)
    const total = pi + monthlyTax + monthlyIns + hoa + pmi
    return { loan, down, pi, monthlyTax, monthlyIns, hoa, pmi, total }
  }, [purchasePrice, downPct, rate, term, annualTax, annualInsurance, monthlyHOA, monthlyPMI])

  return (
    <div>
      <div className="form-grid">
        <DollarInput label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} placeholder="400,000" />
        <PctInput label="Down Payment %" value={downPct} onChange={setDownPct} />
        <PctInput label="Interest Rate %" value={rate} onChange={setRate} />
        <div className="form-group">
          <label className="form-label">Loan Term</label>
          <select className="form-select" value={term} onChange={e => setTerm(e.target.value)}>
            <option value="30">30 years</option>
            <option value="20">20 years</option>
            <option value="15">15 years</option>
          </select>
        </div>
        <DollarInput label="Annual Property Tax" value={annualTax} onChange={setAnnualTax} placeholder="4,000" />
        <DollarInput label="Annual Homeowner's Insurance" value={annualInsurance} onChange={setAnnualInsurance} />
        <DollarInput label="Monthly HOA" value={monthlyHOA} onChange={setMonthlyHOA} />
        <DollarInput
          label="Monthly PMI"
          value={monthlyPMI}
          onChange={setMonthlyPMI}
          note="Typically required when down payment is less than 20%"
        />
      </div>

      {calc && (
        <div className="net-summary">
          <h3>Monthly Payment Breakdown</h3>
          <div className="summary-row"><span>Loan Amount</span><span>${fmt(calc.loan)}</span></div>
          <div className="summary-row"><span>Monthly Principal &amp; Interest</span><span>${fmt(calc.pi)}</span></div>
          <div className="summary-row"><span>Monthly Property Tax</span><span>${fmt(calc.monthlyTax)}</span></div>
          <div className="summary-row"><span>Monthly Insurance</span><span>${fmt(calc.monthlyIns)}</span></div>
          <div className="summary-row"><span>Monthly HOA</span><span>${fmt(calc.hoa)}</span></div>
          <div className="summary-row"><span>Monthly PMI</span><span>${fmt(calc.pmi)}</span></div>
          <div className="summary-row total">
            <span>Total Monthly Payment (PITI)</span>
            <span>${fmt(calc.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
