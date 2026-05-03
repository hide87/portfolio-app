export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).end()
  const { prompt, type } = req.body
  const KEY = process.env.GEMINI_API_KEY
  if (!KEY) return res.status(500).json({ error: 'No API key' })
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: '당신은 전문 포트폴리오 분석가입니다. 한국어로 간결하고 인사이트있는 분석을 마크다운 형식으로 제공하세요.\n\n' + prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    })
    const data = await r.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '분석 불가'
    res.json({ text })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
