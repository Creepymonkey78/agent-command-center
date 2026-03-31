import { useState, useMemo } from 'react'

function num(v) {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function DollarInput({ label, value, onChange, placeholder }) {
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

// Algebraic solve for purchase price:
// Monthly payment = P&I + tax/12 + insurance/12 + HOA
// P&I = Loan * r(1+r)^n / ((1+r)^n - 1)
// Loan = Price * (1 - downPct)
// tax/mo = Price * taxRate / 12
// ins/mo = Price * insRate / 12
// Let M = desired - HOA (available for P&I + tax + ins)
// Let f = mortgage factor = r(1+r)^n / ((1+r)^n - 1)
// P&I = Price*(1-d)*f
// M = Price*(1-d)*f + Price*taxRate/12 + Price*insRate/12
// M = Price * [(1-d)*f + taxRate/12 + insRate/12]
// Price = M / [(1-d)*f + taxRate/12 + insRate/12]
function solvePrice(desiredPayment, rate, termYears, downPct, annualTaxRate, annualInsRate, hoa) {
  const available = desiredPayment - hoa
  if (available <= 0) return 0
  const r = (rate / 100) / 12
  const n = termYears * 12
  const d = downPct / 100
  let f
  if (r === 0) {
    f = n > 0 ? 1 / n : 0
  } else {
    f = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }
  const taxMonthlyRate = (annualTaxRate / 100) / 12
  const insMonthlyRate = (annualInsRate / 100) / 12
  const denom = (1 - d) * f + taxMonthlyRate + insMonthlyRate
  if (denom <= 0) return 0
  return available / denom
}

export default function AffordabilityCalculator() {
  const [desiredPayment, setDesiredPayment] = useState('')
  const [rate, setRate] = useState('6.5')
  const [term, setTerm] = useState('30')
  const [downPct, setDownPct] = useState('20')
  const [taxRate, setTaxRate] = useState('1.0')
  const [insRate, setInsRate] = useState('0.35')
  const [hoa, setHoa] = useState('0')

  const calc = useMemo(() => {
    const payment = num(desiredPayment)
    if (payment <= 0) return null
    const price = solvePrice(payment, num(rate), num(term), num(downPct), num(taxRate), num(insRate), num(hoa))
    if (price <= 0) return null
    const down = price * (num(downPct) / 100)
    const loan = price - down
    const r = (num(rate) / 100) / 12
    const n = num(term) * 12
    let pi
    if (r === 0) {
      pi = n > 0 ? loan / n : 0
    } else {
      pi = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    }
    const monthlyTax = price * (num(taxRate) / 100) / 12
    const monthlyIns = price * (num(insRate) / 100) / 12
    const hoaAmt = num(hoa)
    return { price, down, loan, pi, monthlyTax, monthlyIns, hoaAmt }
  }, [desiredPayment, rate, term, downPct, taxRate, insRate, hoa])

  return (
    <div>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
        How much house can your buyer afford? Input their monthly budget and get a maximum purchase price.
      </p>

      <div className="form-grid">
        <DollarInput label="Desired Monthly Payment (PITI)" value={desiredPayment} onChange={setDesiredPayment} placeholder="2,500" />
        <PctInput label="Interest Rate %" value={rate} onChange={setRate} />
        <div className="form-group">
          <label className="form-label">Loan Term</label>
          <select className="form-select" value={term} onChange={e => setTerm(e.target.value)}>
            <option value="30">30 years</option>
            <option value="20">20 years</option>
            <option value="15">15 years</option>
          </select>
        </div>
        <PctInput label="Down Payment %" value={downPct} onChange={setDownPct} />
        <PctInput label="Annual Property Tax Rate %" value={taxRate} onChange={setTaxRate} />
        <PctInput label="Annual Insurance Rate %" value={insRate} onChange={setInsRate} />
        <DollarInput label="Monthly HOA" value={hoa} onChange={setHoa} />
      </div>

      {calc && (
        <div className="net-summary">
          <h3>Affordability Result</h3>
          <div className="summary-row total" style={{ marginBottom: 16 }}>
            <span>Maximum Purchase Price</span>
            <span>${fmt(calc.price)}</span>
          </div>
          <div className="summary-row"><span>Down Payment ({num(downPct)}%)</span><span>${fmt(calc.down)}</span></div>
          <div className="summary-row"><span>Loan Amount</span><span>${fmt(calc.loan)}</span></div>
          <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: 8, paddingTop: 8 }}>
            <div className="summary-row"><span>Monthly P&amp;I</span><span>${fmt(calc.pi)}</span></div>
            <div className="summary-row"><span>Monthly Property Tax</span><span>${fmt(calc.monthlyTax)}</span></div>
            <div className="summary-row"><span>Monthly Insurance</span><span>${fmt(calc.monthlyIns)}</span></div>
            <div className="summary-row"><span>Monthly HOA</span><span>${fmt(calc.hoaAmt)}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
