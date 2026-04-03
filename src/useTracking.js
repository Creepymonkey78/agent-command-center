const STORAGE_KEY = 'acc_usage_log'
const MAX_ENTRIES = 10000

export function trackUsage(feature) {
  // localStorage tracking (works immediately, persists in this browser)
  try {
    const log = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    log.push({ feature, timestamp: new Date().toISOString() })
    if (log.length > MAX_ENTRIES) log.splice(0, log.length - MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
  } catch {
    // fail silently
  }

  // Fire-and-forget to server endpoint (for future server-side upgrade)
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature, timestamp: new Date().toISOString() }),
  }).catch(() => {})
}

export function getUsageStats() {
  try {
    const log = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const byFeature = {}
    const byFeatureLast30 = {}

    for (const entry of log) {
      byFeature[entry.feature] = (byFeature[entry.feature] || 0) + 1
      if (new Date(entry.timestamp) >= thirtyDaysAgo) {
        byFeatureLast30[entry.feature] = (byFeatureLast30[entry.feature] || 0) + 1
      }
    }

    const last30Days = Object.values(byFeatureLast30).reduce((a, b) => a + b, 0)

    // Recent log entries for display (last 50)
    const recentLog = log.slice(-50).reverse()

    return { total: log.length, byFeature, last30Days, byFeatureLast30, recentLog }
  } catch {
    return { total: 0, byFeature: {}, last30Days: 0, byFeatureLast30: {}, recentLog: [] }
  }
}

export function clearUsageLog() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // fail silently
  }
}
