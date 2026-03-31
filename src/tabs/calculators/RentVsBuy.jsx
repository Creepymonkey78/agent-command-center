import { useState, useMemo } from 'react'

function num(v) {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmt0(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function DollarInput({ label, value, onChange, placeholder }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="dollar-input-wrap">
        <span className="dollar-prefix">$</span>
        <input className="form-input" type="text" placeholder={placeholder || '0'} value={value} onChange={e => onChange(e.target.value)} />
      </div>
    </div>
  )
}

function PctInput({ label, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="pct-input-wrap">
        <input className="form-input" type="text" value={value} onChange={e => onChange(e.target.value)} />
        <span className="pct-suffix">%</span>
      </div>
    </div>
  )
}

function monthlyPI(loan, rate, termYears) {
  const r = (rate / 100) / 12
  const n = termYears * 12
  if (r === 0) return n > 0 ? loan / n : 0
  return loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

// For a given year, compute cumulative totals
function yearlyData(year, inputs) {
  const { rent, rentIncrease, price, downPct, interestRate, termYears, annualTax, annualInsurance, hoa, appreciation } = inputs
  const down = price * downPct
  const loan = price - down
  const r = (interestRate / 100) / 12
  const n = termYears * 12
  const pi = monthlyPI(loan, interestRate, termYears)

  // Monthly ownership cost (P&I + tax + ins + HOA) — fixed for simplicity
  const monthlyTax = annualTax / 12
  const monthlyIns = annualInsurance / 12
  const monthlyOwn = pi + monthlyTax + monthlyIns + hoa

  // Monthly rent at this year (compounding annually)
  const monthlyRent = rent * Math.pow(1 + rentIncrease / 100, year - 1)

  // Monthly equity built = principal paid in that year's first month (approximate as avg)
  // Use the balance at start of the year to estimate
  let balance = loan
  for (let m = 0; m < (year - 1) * 12; m++) {
    const interest = balance * r
    const principal = pi - interest
    balance -= principal
    if (balance < 0) balance = 0
  }
  const interestPaid = balance * r
  const principalPaid = Math.max(0, pi - interestPaid)
  // Home value appreciation in that year
  const homeValue = price * Math.pow(1 + appreciation / 100, year)
  const prevHomeValue = price * Math.pow(1 + appreciation / 100, year - 1)
  const monthlyAppreciation = (homeValue - prevHomeValue) / 12
  const monthlyEquity = principalPaid + monthlyAppreciation

  return { monthlyRent, monthlyOwn, monthlyEquity }
}

export default function RentVsBuy() {
  const [rent, setRent] = useState('')
  const [rentIncrease, setRentIncrease] = useState('3')
  const [price, setPrice] = useState('')
  const [downPct, setDownPct] = useState('20')
  const [rate, setRate] = useState('6.5')
  const [term, setTerm] = useState('30')
  const [annualTax, setAnnualTax] = useState('')
  const [annualIns, setAnnualIns] = useState('1200')
  const [hoa, setHoa] = useState('0')
  const [appreciation, setAppreciation] = useState('3')

  const calc = useMemo(() => {
    const r = num(rent)
    const p = num(price)
    if (r <= 0 || p <= 0) return null

    const inputs = {
      rent: r,
      rentIncrease: num(rentIncrease),
      price: p,
      downPct: num(downPct) / 100,
      interestRate: num(rate),
      termYears: num(term),
      annualTax: num(annualTax),
      annualInsurance: num(annualIns),
      hoa: num(hoa),
      appreciation: num(appreciation),
    }

    const years = [1, 3, 5, 7, 10]
    const rows = years.map(y => ({ year: y, ...yearlyData(y, inputs) }))

    // Break-even: find the year where cumulative ownership < cumulative rent
    // Accumulate month by month up to 30 years
    let cumRent = 0
    let cumOwn = 0
    const down = p * inputs.downPct
    // Include down payment as upfront ownership cost
    cumOwn += down
    const loan = p - down
    const pi = monthlyPI(loan, inputs.interestRate, inputs.termYears)
    const r2 = (inputs.interestRate / 100) / 12
    let breakEven = null

    for (let mo = 1; mo <= 360; mo++) {
      const yr = Math.ceil(mo / 12)
      const monthlyRent = r * Math.pow(1 + inputs.rentIncrease / 100, yr - 1)
      cumRent += monthlyRent
      const monthlyTax = inputs.annualTax / 12
      const monthlyIns = inputs.annualInsurance / 12
      cumOwn += pi + monthlyTax + monthlyIns + inputs.hoa
      if (cumOwn <= cumRent && breakEven === null) {
        breakEven = yr
      }
    }

    // 10-year totals
    let totalRent10 = 0
    let totalOwn10 = 0
    totalOwn10 += down
    for (let mo = 1; mo <= 120; mo++) {
      const yr = Math.ceil(mo / 12)
      totalRent10 += r * Math.pow(1 + inputs.rentIncrease / 100, yr - 1)
      totalOwn10 += pi + inputs.annualTax / 12 + inputs.annualInsurance / 12 + inputs.hoa
    }

    return { rows, breakEven, totalRent10, totalOwn10 }
  }, [rent, rentIncrease, price, downPct, rate, term, annualTax, annualIns, hoa, appreciation])

  return (
    <div>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
        Show your clients when buying becomes cheaper than renting.
      </p>

      <div className="section-label">Renting</div>
      <div className="form-grid">
        <DollarInput label="Current Monthly Rent" value={rent} onChange={setRent} placeholder="1,800" />
        <PctInput label="Annual Rent Increase %" value={rentIncrease} onChange={setRentIncrease} />
      </div>

      <div className="section-label">Buying</div>
      <div className="form-grid">
        <DollarInput label="Home Purchase Price" value={price} onChange={setPrice} placeholder="350,000" />
        <PctInput label="Down Payment %" value={downPct} onChange={setDownPct} />
        <PctInput label="Interest Rate %" value={rate} onChange={setRate} />
        <div className="form-group">
          <label className="form-label">Loan Term</label>
          <select className="form-select" value={term} onChange={e => setTerm(e.target.value)}>
            <option value="30">30 years</option>
            <option value="15">15 years</option>
          </select>
        </div>
        <DollarInput label="Annual Property Tax" value={annualTax} onChange={setAnnualTax} placeholder="3,500" />
        <DollarInput label="Annual Insurance" value={annualIns} onChange={setAnnualIns} />
        <DollarInput label="Monthly HOA" value={hoa} onChange={setHoa} />
        <PctInput label="Annual Home Appreciation %" value={appreciation} onChange={setAppreciation} />
      </div>

      {calc && (
        <div className="net-summary">
          <h3>Rent vs. Buy Comparison</h3>

          {calc.breakEven ? (
            <div className="summary-row total" style={{ marginBottom: 20 }}>
              <span>Break-Even Point</span>
              <span>Year {calc.breakEven}</span>
            </div>
          ) : (
            <div className="summary-row total" style={{ marginBottom: 20, color: 'var(--gray-500)' }}>
              <span>Break-Even Point</span>
              <span>Beyond 30 years</span>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                  <th style={thStyle}>Year</th>
                  <th style={thStyle}>Monthly Rent</th>
                  <th style={thStyle}>Monthly Own. Cost</th>
                  <th style={thStyle}>Monthly Equity Built</th>
                  <th style={thStyle}>Cheaper</th>
                </tr>
              </thead>
              <tbody>
                {calc.rows.map(row => {
                  const rentCheaper = row.monthlyRent < row.monthlyOwn
                  return (
                    <tr key={row.year} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={tdStyle}>{row.year}</td>
                      <td style={tdStyle}>${fmt(row.monthlyRent)}</td>
                      <td style={tdStyle}>${fmt(row.monthlyOwn)}</td>
                      <td style={tdStyle}>${fmt(row.monthlyEquity)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: rentCheaper ? '#059669' : 'var(--blue)' }}>
                        {rentCheaper ? 'Renting' : 'Buying'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, borderTop: '2px solid var(--gray-200)', paddingTop: 12 }}>
            <div className="summary-row"><span>Total Rent Paid (10 yrs)</span><span>${fmt0(calc.totalRent10)}</span></div>
            <div className="summary-row"><span>Total Ownership Cost (10 yrs, incl. down)</span><span>${fmt0(calc.totalOwn10)}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: 'var(--gray-500)',
}

const tdStyle = {
  padding: '10px 12px',
  color: 'var(--gray-700)',
}
