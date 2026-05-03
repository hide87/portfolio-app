module.exports = async (req, res) => {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’)
try {
const KEY = process.env.FINNHUB_API_KEY
const r = await fetch(‘https://finnhub.io/api/v1/forex/rates?base=USD&token=’ + KEY)
const d = await r.json()
if (d && d.quote && d.quote.KRW) return res.json({ usdkrw: d.quote.KRW, changePct: 0 })
throw new Error(‘no rate’)
} catch(e) {
res.json({ usdkrw: 1380, changePct: 0 })
}
}