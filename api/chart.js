export default async function handler(req) {
  const url = new URL(req.url)
  const symbol = url.searchParams.get('symbol')
  const range = url.searchParams.get('range') || '3mo'
  const interval = url.searchParams.get('interval') || '1d'
  try {
    const r = await fetch('https://query2.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?range='+range+'&interval='+​​​​​​​​​​​​​​​​
