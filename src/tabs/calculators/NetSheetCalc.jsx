import { useState, useMemo } from 'react'

function num(v) {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function DollarInput({ label, value, onChange, placeholder, defaultHint }) {
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
      {defaultHint && !value && (
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{defaultHint}</div>
      )}
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

export default function NetSheetCalc() {
  const [mode, setMode] = useState('seller')
  const [address, setAddress] = useState('')
  const [salePrice, setSalePrice] = useState('')

  // Seller fields
  const [mortgagePayoff, setMortgagePayoff] = useState('')
  const [listingPct, setListingPct] = useState('3')
  const [buyerAgentPct, setBuyerAgentPct] = useState('2.5')
  const [sellerTitle, setSellerTitle] = useState('')
  const [closingFee, setClosingFee] = useState('500')
  const [warranty, setWarranty] = useState('550')
  const [repairs, setRepairs] = useState('')
  const [proTaxes, setProTaxes] = useState('')
  const [hoaDues, setHoaDues] = useState('')
  const [sellerOther, setSellerOther] = useState('')

  // Buyer fields
  const [downPct, setDownPct] = useState('20')
  const [originationPct, setOriginationPct] = useState('1')
  const [buyerTitle, setBuyerTitle] = useState('')
  const [appraisal, setAppraisal] = useState('500')
  const [inspection, setInspection] = useState('400')
  const [buyerClosingFee, setBuyerClosingFee] = useState('500')
  const [prepaidInsurance, setPrepaidInsurance] = useState('1200')
  const [prepaidTaxes, setPrepaidTaxes] = useState('')
  const [buyerOther, setBuyerOther] = useState('')

  // Branding
  const [agentName, setAgentName] = useState('')
  const [brokerage, setBrokerage] = useState('')

  const sp = num(salePrice)

  const sellerCalc = useMemo(() => {
    if (sp <= 0) return null
    const listComm = sp * (num(listingPct) / 100)
    const buyerComm = sp * (num(buyerAgentPct) / 100)
    const titleIns = sellerTitle ? num(sellerTitle) : sp * 0.005
    const closeFee = num(closingFee)
    const homeWarranty = num(warranty)
    const repairCredits = num(repairs)
    const propTaxes = num(proTaxes)
    const hoa = num(hoaDues)
    const other = num(sellerOther)
    const totalClosing = listComm + buyerComm + titleIns + closeFee + homeWarranty + repairCredits + propTaxes + hoa + other
    const mortgage = num(mortgagePayoff)
    const net = sp - totalClosing - mortgage
    return { listComm, buyerComm, titleIns, closeFee, homeWarranty, repairCredits, propTaxes, hoa, other, totalClosing, totalCommissions: listComm + buyerComm, otherClosing: totalClosing - listComm - buyerComm, mortgage, net }
  }, [sp, listingPct, buyerAgentPct, sellerTitle, closingFee, warranty, repairs, proTaxes, hoaDues, sellerOther, mortgagePayoff])

  const buyerCalc = useMemo(() => {
    if (sp <= 0) return null
    const downPayment = sp * (num(downPct) / 100)
    const loanAmount = sp - downPayment
    const origFee = loanAmount * (num(originationPct) / 100)
    const titleIns = buyerTitle ? num(buyerTitle) : sp * 0.005
    const appraisalFee = num(appraisal)
    const inspFee = num(inspection)
    const closeFee = num(buyerClosingFee)
    const preInsurance = num(prepaidInsurance)
    const preTaxes = num(prepaidTaxes)
    const other = num(buyerOther)
    const totalClosing = origFee + titleIns + appraisalFee + inspFee + closeFee + preInsurance + preTaxes + other
    const cashNeeded = downPayment + totalClosing
    return { downPayment, loanAmount, origFee, titleIns, appraisalFee, inspFee, closeFee, preInsurance, preTaxes, other, totalClosing, cashNeeded }
  }, [sp, downPct, originationPct, buyerTitle, appraisal, inspection, buyerClosingFee, prepaidInsurance, prepaidTaxes, buyerOther])

  function handlePrint() {
    const isSeller = mode === 'seller'
    const calc = isSeller ? sellerCalc : buyerCalc
    if (!calc) return

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    let rows = ''
    if (isSeller) {
      rows = `
        <tr><td>Sale Price</td><td class="right">$${fmt(sp)}</td></tr>
        <tr class="section"><td colspan="2">Commissions</td></tr>
        <tr><td>Listing Agent Commission (${num(listingPct)}%)</td><td class="right">($${fmt(calc.listComm)})</td></tr>
        <tr><td>Buyer Agent Commission (${num(buyerAgentPct)}%)</td><td class="right">($${fmt(calc.buyerComm)})</td></tr>
        <tr class="section"><td colspan="2">Closing Costs</td></tr>
        <tr><td>Title Insurance</td><td class="right">($${fmt(calc.titleIns)})</td></tr>
        <tr><td>Closing / Settlement Fee</td><td class="right">($${fmt(calc.closeFee)})</td></tr>
        <tr><td>Home Warranty</td><td class="right">($${fmt(calc.homeWarranty)})</td></tr>
        <tr><td>Repairs / Seller Credits</td><td class="right">($${fmt(calc.repairCredits)})</td></tr>
        <tr><td>Prorated Property Taxes</td><td class="right">($${fmt(calc.propTaxes)})</td></tr>
        <tr><td>HOA Dues / Transfer Fees</td><td class="right">($${fmt(calc.hoa)})</td></tr>
        <tr><td>Other Fees</td><td class="right">($${fmt(calc.other)})</td></tr>
        <tr class="section"><td colspan="2">Payoffs</td></tr>
        <tr><td>Mortgage Payoff</td><td class="right">($${fmt(calc.mortgage)})</td></tr>
        <tr class="total"><td>Estimated Net to Seller</td><td class="right ${calc.net < 0 ? 'negative' : ''}">$${fmt(calc.net)}</td></tr>`
    } else {
      rows = `
        <tr><td>Purchase Price</td><td class="right">$${fmt(sp)}</td></tr>
        <tr class="section"><td colspan="2">Loan Details</td></tr>
        <tr><td>Down Payment (${num(downPct)}%)</td><td class="right">$${fmt(calc.downPayment)}</td></tr>
        <tr><td>Loan Amount</td><td class="right">$${fmt(calc.loanAmount)}</td></tr>
        <tr class="section"><td colspan="2">Closing Costs</td></tr>
        <tr><td>Loan Origination Fee (${num(originationPct)}%)</td><td class="right">$${fmt(calc.origFee)}</td></tr>
        <tr><td>Title Insurance</td><td class="right">$${fmt(calc.titleIns)}</td></tr>
        <tr><td>Appraisal Fee</td><td class="right">$${fmt(calc.appraisalFee)}</td></tr>
        <tr><td>Inspection Fee</td><td class="right">$${fmt(calc.inspFee)}</td></tr>
        <tr><td>Closing / Settlement Fee</td><td class="right">$${fmt(calc.closeFee)}</td></tr>
        <tr><td>Prepaid Homeowner's Insurance</td><td class="right">$${fmt(calc.preInsurance)}</td></tr>
        <tr><td>Prepaid Property Taxes</td><td class="right">$${fmt(calc.preTaxes)}</td></tr>
        <tr><td>Other Fees</td><td class="right">$${fmt(calc.other)}</td></tr>
        <tr class="total"><td>Estimated Cash Needed at Closing</td><td class="right">$${fmt(calc.cashNeeded)}</td></tr>`
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${isSeller ? 'Seller' : 'Buyer'} Net Sheet</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;color:#1f2937;padding:40px;max-width:800px;margin:0 auto}
.header{border-bottom:3px solid #004b96;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end}
.header h1{font-family:'Playfair Display',serif;font-size:24px;color:#004b96}
.header .agent{text-align:right;font-size:13px;color:#6b7280}
.header .agent strong{color:#1f2937;display:block}
.address{font-size:14px;color:#6b7280;margin-bottom:4px}
.title{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:20px;color:#1f2937}
table{width:100%;border-collapse:collapse;font-size:14px}
td{padding:8px 12px;border-bottom:1px solid #e5e7eb}
.right{text-align:right;font-variant-numeric:tabular-nums}
.section td{font-weight:700;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#004b96;background:#f9fafb;padding:10px 12px;border-bottom:2px solid #e5e7eb}
.total td{font-weight:700;font-size:18px;font-family:'Playfair Display',serif;border-top:3px solid #004b96;border-bottom:none;padding-top:14px;background:#f0f7ff}
.negative{color:#dc2626}
.disclaimer{margin-top:32px;font-size:11px;color:#9ca3af;line-height:1.5;border-top:1px solid #e5e7eb;padding-top:16px}
.date{font-size:12px;color:#9ca3af;margin-bottom:16px}
@media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div><h1>Lindsey &amp; Associates, Inc.</h1></div>
  <div class="agent">
    ${agentName ? `<strong>${agentName}</strong>` : ''}
    ${brokerage ? brokerage : ''}
  </div>
</div>
<div class="date">${today}</div>
${address ? `<div class="address">${address}</div>` : ''}
<div class="title">${isSeller ? 'Seller' : 'Buyer'} Estimated Net Sheet</div>
<table>${rows}</table>
<div class="disclaimer">This is an estimate only and should not be relied upon as a guarantee of actual costs or proceeds. Please consult your closing agent or attorney for exact figures prior to closing.</div>
</body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 400)
  }

  return (
    <div>
      <div className="form-group">
        <div className="form-label">Mode</div>
        <div className="toggle-group">
          <button className={`toggle-btn${mode === 'seller' ? ' active' : ''}`} onClick={() => setMode('seller')}>
            Seller Net Sheet
          </button>
          <button className={`toggle-btn${mode === 'buyer' ? ' active' : ''}`} onClick={() => setMode('buyer')}>
            Buyer Net Sheet
          </button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Property Address</label>
          <input className="form-input" type="text" placeholder="123 Main St, City, State" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <DollarInput label="Sale Price" value={salePrice} onChange={setSalePrice} placeholder="350,000" />
      </div>

      {mode === 'seller' ? (
        <>
          <DollarInput label="Mortgage Payoff Balance" value={mortgagePayoff} onChange={setMortgagePayoff} placeholder="200,000" />

          <div className="section-label">Closing Costs</div>
          <div className="form-grid">
            <PctInput label="Listing Commission %" value={listingPct} onChange={setListingPct} />
            <PctInput label="Buyer Agent Commission %" value={buyerAgentPct} onChange={setBuyerAgentPct} />
            <DollarInput label="Title Insurance" value={sellerTitle} onChange={setSellerTitle} defaultHint={sp > 0 ? `Auto: $${fmt(sp * 0.005)} (0.5% of sale price)` : undefined} />
            <DollarInput label="Closing / Settlement Fee" value={closingFee} onChange={setClosingFee} />
            <DollarInput label="Home Warranty" value={warranty} onChange={setWarranty} />
            <DollarInput label="Repairs / Seller Credits" value={repairs} onChange={setRepairs} />
            <DollarInput label="Prorated Property Taxes" value={proTaxes} onChange={setProTaxes} />
            <DollarInput label="HOA Dues / Transfer Fees" value={hoaDues} onChange={setHoaDues} />
            <DollarInput label="Other Fees" value={sellerOther} onChange={setSellerOther} />
          </div>

          {sellerCalc && (
            <div className="net-summary">
              <h3>Seller Net Sheet Summary</h3>
              <div className="summary-row"><span>Sale Price</span><span>${fmt(sp)}</span></div>
              <div className="summary-row"><span>Total Commissions</span><span>-${fmt(sellerCalc.totalCommissions)}</span></div>
              <div className="summary-row"><span>Other Closing Costs</span><span>-${fmt(sellerCalc.otherClosing)}</span></div>
              <div className="summary-row"><span>Mortgage Payoff</span><span>-${fmt(sellerCalc.mortgage)}</span></div>
              <div className={`summary-row total${sellerCalc.net < 0 ? ' negative' : ''}`}>
                <span>Estimated Net to Seller</span>
                <span>${fmt(sellerCalc.net)}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="section-label">Loan Details</div>
          <div className="form-grid">
            <PctInput label="Down Payment %" value={downPct} onChange={setDownPct} />
            <PctInput label="Loan Origination Fee %" value={originationPct} onChange={setOriginationPct} />
          </div>

          <div className="section-label">Closing Costs</div>
          <div className="form-grid">
            <DollarInput label="Title Insurance" value={buyerTitle} onChange={setBuyerTitle} defaultHint={sp > 0 ? `Auto: $${fmt(sp * 0.005)} (0.5% of sale price)` : undefined} />
            <DollarInput label="Appraisal Fee" value={appraisal} onChange={setAppraisal} />
            <DollarInput label="Inspection Fee" value={inspection} onChange={setInspection} />
            <DollarInput label="Closing / Settlement Fee" value={buyerClosingFee} onChange={setBuyerClosingFee} />
            <DollarInput label="Prepaid Homeowner's Insurance" value={prepaidInsurance} onChange={setPrepaidInsurance} />
            <DollarInput label="Prepaid Property Taxes" value={prepaidTaxes} onChange={setPrepaidTaxes} />
            <DollarInput label="Other Fees" value={buyerOther} onChange={setBuyerOther} />
          </div>

          {buyerCalc && (
            <div className="net-summary">
              <h3>Buyer Net Sheet Summary</h3>
              <div className="summary-row"><span>Purchase Price</span><span>${fmt(sp)}</span></div>
              <div className="summary-row"><span>Down Payment ({num(downPct)}%)</span><span>${fmt(buyerCalc.downPayment)}</span></div>
              <div className="summary-row"><span>Loan Amount</span><span>${fmt(buyerCalc.loanAmount)}</span></div>
              <div className="summary-row"><span>Total Closing Costs</span><span>${fmt(buyerCalc.totalClosing)}</span></div>
              <div className="summary-row total">
                <span>Estimated Cash Needed at Closing</span>
                <span>${fmt(buyerCalc.cashNeeded)}</span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="section-label" style={{ marginTop: 32 }}>Branding (for printed sheet)</div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input className="form-input" type="text" placeholder="Jane Smith" value={agentName} onChange={e => setAgentName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Brokerage</label>
          <input className="form-input" type="text" placeholder="Lindsey & Associates, Inc." value={brokerage} onChange={e => setBrokerage(e.target.value)} />
        </div>
      </div>

      <button className="btn-print" onClick={handlePrint} disabled={sp <= 0}>
        &#128424; Print / Save Net Sheet as PDF
      </button>
    </div>
  )
}
