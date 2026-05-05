export default async function handler(req) {
  try {
    const KEY = process.env.FINNHUB_API_KEY
    const r = await fetch('https://finnhub.io/api/v1/forex/rates?base=USD&token='+KEY)
    const d = await r.json()
    if(d?.quote?.KRW) return new Response(JSON.stringify({usdkrw:d.quote.KRW,changePct:0}),{headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}})
    throw new Error('no rate')
  } catch(e) {
    return new Response(JSON.stringify({usdkrw:1380,changePct:0}),​​​​​​​​​​​​​​​​
