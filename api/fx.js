export const config = { runtime: ‘edge’ }

export default async function handler(req) {
try {
const KEY = process.env.FINNHUB_API_KEY
const r = await fetch(`https://finnhub.io/api/v1/forex/rates?base=USD&token=${KEY}`)
const data = await r.json()
const krw = data?.quote?.KRW
if (krw) {
return new Response(JSON.stringify({ usdkrw: krw, changePct: 0 }), {
headers: { ‘Content-Type’: ‘application/json’, ‘Access-Control-Allow-Origin’: ‘*’ }
})
}
throw new Error(‘No KRW rate’)
} catch {
return new Response(JSON.stringify({ usdkrw: 1380, changePct: 0 }), {
headers: { ‘Content-Type’: ‘application/json’, ‘Access-Control-Allow-Origin’: ’*’ }
})
}
}