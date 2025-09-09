import { useEffect, useState } from 'react'
import { api, getToken, setAuthToken } from '../lib/api'
import { Link, useNavigate } from 'react-router-dom'

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
  const nav = useNavigate()
  useEffect(() => {
    const t = getToken(); if (t) setAuthToken(t)
    api.get('/events').then(r => setItems(r.data.items))
      .catch(() => nav('/login'))
  }, [])
  return (
    <div className="grid gap-4">
      {items.map(e => (
        <Link key={e.id} to={`/event/${e.id}`} className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">{e.name}</h2>
            <p>{new Date(e.start_at).toLocaleString('de-AT')}</p>
            <progress className="progress progress-primary w-full" value={e.progressPct} max={100}></progress>
            <div className="text-sm opacity-70">{e.booked_seats} / {e.total_seats}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

