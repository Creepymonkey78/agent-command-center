import { Redis } from '@upstash/redis'

// Supports both Vercel KV (KV_REST_API_*) and native Upstash (UPSTASH_REDIS_REST_*) env var names
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
})

const KNOWN_FEATURES = [
  'Client Comms',
  'Offer Advisor',
  'Counteroffer',
  'Listing Advisor',
  'Social Media',
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  // ── POST /api/track — record a usage event ──────────────────────────────
  if (req.method === 'POST') {
    const { feature } = req.body || {}
    if (!feature) {
      return res.status(400).json({ error: 'Missing feature' })
    }

    const timestamp = new Date().toISOString()
    const entry = JSON.stringify({ feature, timestamp })

    try {
      await Promise.all([
        redis.incr('acc:count:total'),
        redis.incr(`acc:count:${feature}`),
        redis.sadd('acc:features', feature),
        redis.lpush('acc:log', entry),
      ])
      // Cap log at 200 most recent entries
      await redis.ltrim('acc:log', 0, 199)

      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error('[track] Redis write error:', err.message)
      return res.status(500).json({ error: 'Tracking write failed' })
    }
  }

  // ── GET /api/track — return stats for admin dashboard ──────────────────
  if (req.method === 'GET') {
    try {
      // Fetch total count, per-feature counts, and raw log in parallel
      const featuresToFetch = KNOWN_FEATURES

      const [total, ...featureCounts] = await Promise.all([
        redis.get('acc:count:total'),
        ...featuresToFetch.map(f => redis.get(`acc:count:${f}`)),
      ])

      const byFeature = {}
      featuresToFetch.forEach((f, i) => {
        const count = parseInt(featureCounts[i] || 0, 10)
        if (count > 0) byFeature[f] = count
      })

      // Get up to 200 recent log entries
      const rawLog = await redis.lrange('acc:log', 0, 199)
      const recentActivity = rawLog
        .map(entry => {
          try {
            return typeof entry === 'string' ? JSON.parse(entry) : entry
          } catch {
            return null
          }
        })
        .filter(Boolean)

      // Last 30 days — filter from the log (approximate since log is capped at 200)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recentEntries = recentActivity.filter(
        e => new Date(e.timestamp) >= thirtyDaysAgo
      )
      const byFeatureLast30 = {}
      for (const e of recentEntries) {
        byFeatureLast30[e.feature] = (byFeatureLast30[e.feature] || 0) + 1
      }

      return res.status(200).json({
        total: parseInt(total || 0, 10),
        byFeature,
        last30Days: {
          total: recentEntries.length,
          byFeature: byFeatureLast30,
        },
        recentActivity,
      })
    } catch (err) {
      console.error('[track] Redis read error:', err.message)
      return res.status(500).json({ error: 'Tracking read failed' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
