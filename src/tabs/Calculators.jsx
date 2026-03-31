import { useState } from 'react'
import NetSheetCalc from './calculators/NetSheetCalc.jsx'
import MortgageEstimator from './calculators/MortgageEstimator.jsx'
import AffordabilityCalculator from './calculators/AffordabilityCalculator.jsx'
import RentVsBuy from './calculators/RentVsBuy.jsx'
import CommissionCalculator from './calculators/CommissionCalculator.jsx'

const CALCS = [
  { id: 'netsheet', label: 'Net Sheet' },
  { id: 'mortgage', label: 'Mortgage Estimator' },
  { id: 'affordability', label: 'Affordability' },
  { id: 'rentvsbuy', label: 'Rent vs. Buy' },
  { id: 'commission', label: 'Commission' },
]

export default function Calculators() {
  const [active, setActive] = useState('netsheet')

  return (
    <div>
      <div className="badge-instant">&#9889; Instant Math — No AI Required</div>

      <div className="calc-subnav">
        {CALCS.map(c => (
          <button
            key={c.id}
            className={`calc-subnav-btn${active === c.id ? ' active' : ''}`}
            onClick={() => setActive(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div key={active} className="tab-panel" style={{ marginTop: 24 }}>
        {active === 'netsheet' && <NetSheetCalc />}
        {active === 'mortgage' && <MortgageEstimator />}
        {active === 'affordability' && <AffordabilityCalculator />}
        {active === 'rentvsbuy' && <RentVsBuy />}
        {active === 'commission' && <CommissionCalculator />}
      </div>
    </div>
  )
}
