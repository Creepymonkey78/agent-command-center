import { useState, useEffect } from 'react'
import ClientComms from './tabs/ClientComms.jsx'
import OfferAdvisor from './tabs/OfferAdvisor.jsx'
import ListingAdvisor from './tabs/ListingAdvisor.jsx'
import SocialMedia from './tabs/SocialMedia.jsx'
import Calculators from './tabs/Calculators.jsx'
import AdminPanel from './AdminPanel.jsx'

const TABS = [
  { id: 'comms', label: '\u{1F4AC} Client Comms' },
  { id: 'offer', label: '\u{1F3AF} Offer Advisor' },
  { id: 'listing', label: '\u{1F4CB} Listing Advisor' },
  { id: 'social', label: '\u{1F4F1} Social Media' },
  { id: 'calculators', label: '\u{1F522} Calculators' },
]

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return new URLSearchParams(window.location.search).get('admin') === 'true'
  })
  useEffect(() => {
    function onPopState() {
      setIsAdmin(new URLSearchParams(window.location.search).get('admin') === 'true')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  return isAdmin
}

export default function App() {
  const [activeTab, setActiveTab] = useState('comms')
  const now = useClock()
  const isAdmin = useAdminMode()

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
            <div className="header-wordmark">
              <span className="header-wordmark-name">Lindsey</span>
              <span className="header-wordmark-associates">&amp; Associates, Inc.</span>
            </div>
            <div className="header-title">Agent Command Center</div>
            <div className="header-subtitle">AI-Powered Productivity Suite for Top-Producing Agents</div>
          </div>
          <div className="header-datetime">
            <div className="date">{dateStr}</div>
            <div>{timeStr}</div>
          </div>
        </div>
      </header>

      {isAdmin ? (
        <main className="main-content">
          <AdminPanel />
        </main>
      ) : (
        <>
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
              {activeTab === 'social' && <SocialMedia />}
              {activeTab === 'calculators' && <Calculators />}
            </div>
          </main>
        </>
      )}

      <footer className="app-footer">
        Lindsey &amp; Associates, Inc. &middot; Agent Command Center &middot; Powered by AI
      </footer>
    </>
  )
}
