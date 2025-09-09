import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, getToken, setAuthToken } from '../lib/api'

type Event = any

export default function EventDetail() {
  const { eventId } = useParams()
  const [ev, setEv] = useState<Event | null>(null)
  const [qty, setQty] = useState(2)
  const [message, setMessage] = useState<string | null>(null)
  const [menus, setMenus] = useState<any[] | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  useEffect(() => {
    const t = getToken(); if (t) setAuthToken(t)
    api.get(`/events/${eventId}`).then(async r => {
      setEv(r.data)
      const url = r.data?.menus?.menu_url as string | undefined
      if (url) {
        const { data } = await api.get(url)
        setMenus(data.menus || [])
      }
    })
  }, [eventId])
  const book = async () => {
    const { data } = await api.post(`/events/${eventId}/book`, { quantity: qty, menu: { id: menuId } })
    setEv(data)
    if (data.message) setMessage(data.message)
  }
  if (!ev) return null
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{ev.name}</h1>
      <div>{new Date(ev.start_at).toLocaleString('de-AT')} • {ev.location}</div>
      <div className="space-y-2">
        <progress className="progress progress-primary w-full" value={ev.progressPct} max={100}></progress>
        <div className="text-sm opacity-70">{ev.booked_seats} / {ev.total_seats}</div>
      </div>
      <div className="card bg-base-100 shadow p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span>Sitze:</span>
          <input type="number" min={1} className="input input-bordered w-24" value={qty} onChange={e => setQty(parseInt(e.target.value || '1'))} />
          {menus && (
            <select className="select select-bordered" value={menuId ?? ''} onChange={e=>setMenuId(e.target.value)}>
              <option value="">Menü auswählen</option>
              {menus.map((m:any)=> <option key={m.id} value={m.id}>{m.name} – {new Intl.NumberFormat('de-AT', { style:'currency', currency:'EUR' }).format(m.price)}</option>)}
            </select>
          )}
          <button className="btn btn-primary" onClick={book}>Buchen</button>
        </div>
        {message && <div className="text-sm text-warning">{message}</div>}
      </div>
      {ev.perks?.free_dessert && <div className="badge badge-success">Gratis Dessert</div>}
    </div>
  )
}
