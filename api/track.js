// Usage tracking endpoint.
// Currently a no-op stub — tracking is handled client-side via localStorage.
//
// To upgrade to server-side tracking with Vercel KV:
// 1. Run: npm install @vercel/kv
// 2. Add KV integration in Vercel dashboard (Storage > Create KV)
// 3. Replace the handler body with KV logic (see commented example below)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Acknowledge receipt — actual storage happens in localStorage on the client
  return res.status(200).json({ ok: true })

  // --- Vercel KV upgrade path (uncomment when KV is configured) ---
  // const { kv } = await import('@vercel/kv')
  // const { feature, timestamp } = req.body || {}
  // if (!feature) return res.status(400).json({ error: 'Missing feature' })
  // await Promise.all([
  //   kv.lpush('acc:log', JSON.stringify({ feature, timestamp: timestamp || new Date().toISOString() })),
  //   kv.ltrim('acc:log', 0, 9999),
  //   kv.incr(`acc:count:${feature}`),
  //   kv.incr('acc:count:total'),
  // ])
  // return res.status(200).json({ ok: true })
}
