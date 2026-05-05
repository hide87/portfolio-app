export default async function handler(req) {
  const url = new URL(req.url)
  const ticker = url.searchParams.get('ticker')
  if(!ticker) return new Response(JSON.stringify({error:'No ticker'}),{status:400,headers:{'Content-Type':'application/json'}})
  const KEY = process.env.FINNHUB_API_KEY
  try {
    const [calR, epsR] = await Promise.all([
      fetch('https://finnhub.io/api/v1/calendar/earnings?symbol='+ticker+'&token='+KEY),
      fetch('https://finnhub.io/api/v1/stock/earnings?symbol='+ticker+'&token='+KEY)
    ])
    const calData = await calR.json()
    const epsData = await epsR.json()
    const upcoming = (calData?.earningsCalendar||[]).filter(e=>new Date(e.date)>=new Date())
    const earningsDate = upcoming.length ? upcoming[0].date : null
    const earningsHistory = Array.isArray(epsData) ? epsData.slice(0,4).map(e=>({
      date:e.period, epsActual:e.actual, epsEstimate:e.estimate,
      surprisePct:e.estimate&&e.actual!=null?(e.actual-e.estimate)/Math.abs(e.estimate)*100:null
    })) : []
    const quarterlyEPS = Array.isArray(epsData) ? epsData.slice(0,6).map(e=>({date:e.period,actual:e.actual,estimate:e.estimate})) : []
    return new Response(JSON.stringify({earningsDate,earningsHistory,quarterlyEPS}),{headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}})
  } catch(e) {
    return new Response(JSON.stringify({error:e.message}),{status:500,headers:{'Content-Type':'application/json'}})
  }
}
