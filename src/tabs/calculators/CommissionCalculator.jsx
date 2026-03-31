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
        <input className="form-input" type="text" placeholder={placeholder || '0'} value={value} onChange={e => onChange(e.target.value)} />
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
        <input className="form-input" type="text" value={value} onChange={e => onChange(e.target.value)} />
        <span className="pct-suffix">%</span>
      </div>
    </div>
  )
}

export default function CommissionCalculator() {
  const [salePrice, setSalePrice] = useState('')
  const [commissionPct, setCommissionPct] = useState('3')
  const [agentSplitPct, setAgentSplitPct] = useState('70')
  const [referralPct, setReferralPct] = useState('0')
  const [transactionFee, setTransactionFee] = useState('0')
  const [franchisePct, setFranchisePct] = useState('0')

  const calc = useMemo(() => {
    const sp = num(salePrice)
    if (sp <= 0) return null
    const gross = sp * (num(commissionPct) / 100)
    const referralFee = gross * (num(referralPct) / 100)
    const netAfterReferral = gross - referralFee
    const brokeragePortion = netAfterReferral * ((100 - num(agentSplitPct)) / 100)
    const agentAfterSplit = netAfterReferral - brokeragePortion
    const txFee = num(transactionFee)
    const franchiseFee = netAfterReferral * (num(franchisePct) / 100)
    const takeHome = agentAfterSplit - txFee - franchiseFee
    const effectiveRate = sp > 0 ? (takeHome / sp) * 100 : 0
    return { gross, referralFee, netAfterReferral, brokeragePortion, agentAfterSplit, txFee, franchiseFee, takeHome, effectiveRate }
  }, [salePrice, commissionPct, agentSplitPct, referralPct, transactionFee, franchisePct])

  return (
    <div>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
        See your actual take-home on any deal.
      </p>

      <div className="form-grid">
        <DollarInput label="Sale Price" value={salePrice} onChange={setSalePrice} placeholder="450,000" />
        <PctInput label="Commission %" value={commissionPct} onChange={setCommissionPct} />
        <PctInput label="Brokerage Split — Agent's Share %" value={agentSplitPct} onChange={setAgentSplitPct} />
        <PctInput label="Referral Fee %" value={referralPct} onChange={setReferralPct} />
        <DollarInput
          label="Transaction Fee"
          value={transactionFee}
          onChange={setTransactionFee}
          note="Flat fee some brokerages charge"
        />
        <PctInput label="Franchise Fee %" value={franchisePct} onChange={setFranchisePct} />
      </div>

      {calc && (
        <div className="net-summary">
          <h3>Commission Breakdown</h3>
          <div className="summary-row"><span>Gross Commission</span><span>${fmt(calc.gross)}</span></div>
          <div className="summary-row" style={{ color: 'var(--red-600)' }}>
            <span>Less Referral Fee ({num(referralPct)}%)</span>
            <span>-${fmt(calc.referralFee)}</span>
          </div>
          <div className="summary-row"><span>Net Commission (after referral)</span><span>${fmt(calc.netAfterReferral)}</span></div>
          <div className="summary-row" style={{ color: 'var(--red-600)' }}>
            <span>Less Brokerage Portion ({(100 - num(agentSplitPct)).toFixed(0)}%)</span>
            <span>-${fmt(calc.brokeragePortion)}</span>
          </div>
          <div className="summary-row" style={{ color: 'var(--red-600)' }}>
            <span>Less Transaction Fee</span>
            <span>-${fmt(calc.txFee)}</span>
          </div>
          <div className="summary-row" style={{ color: 'var(--red-600)' }}>
            <span>Less Franchise Fee ({num(franchisePct)}%)</span>
            <span>-${fmt(calc.franchiseFee)}</span>
          </div>
          <div style={{ borderTop: '2px solid var(--gray-300)', margin: '12px 0' }} />
          <div className="summary-row total">
            <span>Agent Take-Home</span>
            <span>${fmt(calc.takeHome)}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8, textAlign: 'right' }}>
            Effective rate: {calc.effectiveRate.toFixed(2)}% of sale price
          </div>
        </div>
      )}
    </div>
  )
}
