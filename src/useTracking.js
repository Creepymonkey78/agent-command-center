export function trackUsage(feature) {
  // Fire-and-forget — never blocks the UI or shows errors to agents
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature }),
  }).catch(() => {})
}
