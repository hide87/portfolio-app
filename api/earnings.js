export default async function handler(req, res) {
  const ticker = req.query.ticker
  if(!ticker) return res.status(400).json({error:'No ticker'})
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
    res.setHeader('Access-Control-Allow-Origin','*')
    res.json({earningsDate,earningsHistory,quarterlyEPS})
  } catch(e) {
    res.status(500).json({error:e.message})
  }
}
