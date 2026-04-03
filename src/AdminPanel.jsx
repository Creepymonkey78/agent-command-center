import { useState, useEffect, useCallback } from 'react'

const FEATURE_ORDER = [
  'Client Comms',
  'Offer Advisor',
  'Counteroffer',
  'Listing Advisor',
  'Social Media',
]

function fmt(n) {
  return (n || 0).toLocaleString()
}

function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/track')
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const allFeatures = stats
    ? [
        ...FEATURE_ORDER,
        ...Object.keys(stats.byFeature).filter(f => !FEATURE_ORDER.includes(f)),
      ]
    : FEATURE_ORDER

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--blue)', marginBottom: 4 }}>
          Usage Dashboard
        </h2>
        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
          Server-side tracking via Upstash Redis · All agents · All devices
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 0', color: 'var(--gray-400)', fontSize: 14 }}>
          <div className="spinner" />
          Loading stats...
        </div>
      )}

      {error && (
        <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', color: 'var(--red-600)', fontSize: 14, marginBottom: 24 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {stats && !loading && (
        <>
          {/* Top-level stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total AI Requests" value={fmt(stats.total)} />
            <StatCard label="Last 30 Days" value={fmt(stats.last30Days?.total)} />
            <StatCard label="Features Active" value={fmt(Object.keys(stats.byFeature).length)} />
          </div>

          {/* By feature — all time vs last 30 days */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', marginBottom: 24 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
                Usage by Feature
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <th style={thStyle}>Feature</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>All Time</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Last 30 Days</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {allFeatures.map(feature => {
                  const total = stats.byFeature[feature] || 0
                  const recent = stats.last30Days?.byFeature?.[feature] || 0
                  const pct = stats.total > 0 ? ((total / stats.total) * 100).toFixed(1) : '0.0'
                  if (total === 0) return null
                  return (
                    <tr key={feature} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={tdStyle}>{feature}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{fmt(total)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(recent)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--gray-400)' }}>{pct}%</td>
                    </tr>
                  )
                })}
                {stats.total === 0 && (
                  <tr>
                    <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: 'var(--gray-400)', padding: '24px 16px' }}>
                      No usage recorded yet. Use any AI feature to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recent activity */}
          {stats.recentActivity?.length > 0 && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', marginBottom: 24 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
                  Recent Activity (last 200)
                </span>
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {stats.recentActivity.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 20px',
                      borderBottom: '1px solid var(--gray-100)',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--gray-700)', fontWeight: 500 }}>{entry.feature}</span>
                    <span style={{ color: 'var(--gray-400)' }}>
                      {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {relativeTime(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={fetchStats}
          disabled={loading}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 18px',
            background: 'var(--blue)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div style={{ marginTop: 32, fontSize: 11, color: 'var(--gray-300)' }}>
        Access this panel at <code>?admin=true</code> — not linked anywhere in the app.
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      borderTop: '3px solid var(--blue)',
    }}>
      <div style={{ fontSize: 28, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
        {label}
      </div>
    </div>
  )
}

const thStyle = {
  padding: '10px 16px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: 'var(--gray-400)',
  textAlign: 'left',
}

const tdStyle = {
  padding: '11px 16px',
  color: 'var(--gray-700)',
}
