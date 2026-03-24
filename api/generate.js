const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: missing ANTHROPIC_API_KEY environment variable' })
  }

  const { model, max_tokens, messages } = req.body || {}
  if (!model || !messages) {
    return res.status(400).json({ error: 'Missing required fields: model, messages' })
  }

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    })

    const body = await response.text()

    // Forward the Anthropic status code and body as-is
    res.status(response.status)
    res.setHeader('Content-Type', 'application/json')
    return res.send(body)
  } catch (err) {
    return res.status(502).json({
      error: 'Failed to reach the Anthropic API. Please try again.',
    })
  }
}
