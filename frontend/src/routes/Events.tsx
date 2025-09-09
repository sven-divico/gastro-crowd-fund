import { useEffect, useMemo, useState } from 'react'
import { api, getToken, setAuthToken } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAssetsBase } from '../lib/config'
import SegmentedProgress from '../components/SegmentedProgress'

type Event = {
  id: number
  name: string
  description: string
  start_at: string
  cutoff_at: string
  total_seats: number
  booked_seats: number
  hero_media?: { image?: string }
  perks?: any
  progressPct?: number
}

export default function Events() {
  const [items, setItems] = useState<Event[]>([])
  const [showNextDays, setShowNextDays] = useState(7)
  const nav = useNavigate()
  const { data } = useQuery({
    queryKey: ['events', showNextDays],
    queryFn: async () => {
      const t = getToken(); if (t) setAuthToken(t)
      const now = new Date()
      const to = new Date(now); to.setDate(now.getDate() + showNextDays)
      const fromISO = now.toISOString()
      const toISO = to.toISOString()
      const r = await api.get(`/events?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`)
      return r.data.items as Event[]
    },
  })
  useEffect(()=>{ if (data) setItems(data) }, [data])

  const filtered = useMemo(()=>{
    const now = new Date()
    const to = new Date(now)
    to.setDate(now.getDate() + showNextDays)
    return items.filter(e => {
      const d = new Date(e.start_at)
      return d >= now && d <= to
    })
  }, [items, showNextDays])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="opacity-70 flex items-center gap-1"><CalendarDays size={18}/> Zeitraum:</span>
        <select className="select select-bordered w-40" value={showNextDays} onChange={e=>setShowNextDays(parseInt(e.target.value))}>
          <option value={3}>3 Tage</option>
          <option value={7}>7 Tage</option>
          <option value={14}>14 Tage</option>
          <option value={30}>30 Tage</option>
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(e => (
          <Link key={e.id} to={`/event/${e.id}`} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            {e.hero_media?.image && (
              <figure><img src={`${getAssetsBase()}/media/${e.hero_media.image}`} alt="Event" className="h-40 w-full object-cover" loading="lazy" /></figure>
            )}
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title">{e.name}</h2>
                <div className="flex items-center gap-2">
                  {e.status && <span className="badge badge-outline">{e.status}</span>}
                  {e.almostThere && <span className="badge badge-warning">Fast geschafft</span>}
                </div>
              </div>
              <div className="opacity-70 text-sm">
                {new Date(e.start_at).toLocaleString('de-AT')}
              </div>
              <div className="space-y-2">
                <SegmentedProgress total={e.total_seats} booked={e.booked_seats} minGoal={e.min_bookings ?? e.total_seats} />
                <div className="text-sm opacity-80">{e.booked_seats} / {e.total_seats}</div>
                {/* Perks badges */}
                {e.perks && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(e.perks).map(([k,v])=> (
                      <span key={k} className={`badge ${badgeColor(k)}`}>{formatPerk(k, v as any)}</span>
                    ))}
                  </div>
                )}
                {e.super_perks && e.super_perks.length > 0 && (e.minReached || e.superPerksUnlocked) && (
                  <div className="mt-2 p-3 border border-success/40 bg-success/10 rounded">
                    <div className="font-medium mb-1">Super Perks freigeschaltet 🎉</div>
                    <div className="flex flex-wrap gap-2">
                      {e.super_perks.map((sp:string) => (
                        <span key={sp} className="badge badge-success">{sp}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function badgeColor(key: string){
  switch(key){
    case 'free_dessert': return 'badge-success'
    case 'welcome_drink': return 'badge-info'
    case 'loyalty_points': return 'badge-warning'
    default: return 'badge-secondary'
  }
}
function formatPerk(key: string, val: any){
  if (key === 'loyalty_points') return `${val} Punkte`
  if (typeof val === 'boolean') return key.replace('_',' ').replace(/\b\w/g, c=>c.toUpperCase())
  return `${key}: ${val}`
}
