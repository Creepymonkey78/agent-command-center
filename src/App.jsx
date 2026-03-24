import { useState, useEffect } from 'react'
import logoImg from './assets/LINDSEY AND ASSOCIATES LETTERING Black.png'
import ClientComms from './tabs/ClientComms.jsx'
import OfferAdvisor from './tabs/OfferAdvisor.jsx'
import ListingAdvisor from './tabs/ListingAdvisor.jsx'
import NetSheet from './tabs/NetSheet.jsx'

const TABS = [
  { id: 'comms', label: '\u{1F4AC} Client Comms' },
  { id: 'offer', label: '\u{1F3AF} Offer Advisor' },
  { id: 'listing', label: '\u{1F4CB} Listing Advisor' },
  { id: 'netsheet', label: '\u{1F522} Net Sheet' },
]

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function App() {
  const [activeTab, setActiveTab] = useState('comms')
  const now = useClock()

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  })

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <img src={logoImg} alt="Lindsey & Associates, Inc." className="header-logo" />
            <div className="header-title">Agent Command Center</div>
            <div className="header-subtitle">AI-Powered Productivity Suite for Top-Producing Agents</div>
          </div>
          <div className="header-datetime">
            <div className="date">{dateStr}</div>
            <div>{timeStr}</div>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        <div className="tab-nav-inner">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        <div className="tab-panel" key={activeTab}>
          {activeTab === 'comms' && <ClientComms />}
          {activeTab === 'offer' && <OfferAdvisor />}
          {activeTab === 'listing' && <ListingAdvisor />}
          {activeTab === 'netsheet' && <NetSheet />}
        </div>
      </main>

      <footer className="app-footer">
        Lindsey &amp; Associates, Inc. &middot; Agent Command Center &middot; Powered by AI
      </footer>
    </>
  )
}
