import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, getToken, setAuthToken } from '../lib/api'
import HeroMedia from '../components/HeroMedia'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { ShoppingCart } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import SegmentedProgress from '../components/SegmentedProgress'
import { Users, Clock3, Utensils, PartyPopper, Target } from 'lucide-react'

type Event = any

export default function EventDetail() {
  const { eventId } = useParams()
  const [ev, setEv] = useState<Event | null>(null)
  const [qty, setQty] = useState(2)
  const [message, setMessage] = useState<string | null>(null)
  const [menus, setMenus] = useState<any[] | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const prevPct = useRef<number>(0)
  const prevStatus = useRef<string | null>(null)
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const t = getToken(); if (t) setAuthToken(t)
      const r = await api.get(`/events/${eventId}`)
      const url = r.data?.menus?.menu_url as string | undefined
      if (url) {
        const { data } = await api.get(url)
        setMenus(data.menus || [])
      }
      setEv(r.data)
      return r.data
    }
  })

  const bookMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/events/${eventId}/book`, { quantity: qty, menu: { id: menuId } })
      return data
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['event', eventId] })
      const prev = queryClient.getQueryData(['event', eventId]) as any
      if (prev) {
        const optimistic = { ...prev, booked_seats: Math.min(prev.total_seats, prev.booked_seats + Math.max(qty,0)) }
        optimistic.progressPct = Math.round((optimistic.booked_seats/optimistic.total_seats)*1000)/10
        queryClient.setQueryData(['event', eventId], optimistic)
        setEv(optimistic)
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['event', eventId], ctx.prev)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['event', eventId], data)
      setEv(data)
      if (data.message) { setMessage(data.message); toast(data.message) } else { toast.success('Buchung erfasst') }
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['events'] }) },
  })

  const book = async () => {
    if (menus && !menuId) {
      toast.error('Bitte Menü auswählen')
      return
    }
    bookMutation.mutate()
  }
  useEffect(()=>{
    if (!ev) return
    // Confetti at 80% and 100%, modal on confirmed
    const pct = ev.progressPct ?? 0
    if ((prevPct.current < 80 && pct >= 80) || (prevPct.current < 100 && pct >= 100)) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } })
    }
    if (prevStatus.current !== 'CONFIRMED' && ev.status === 'CONFIRMED') {
      ;(document.getElementById('confirm-modal') as HTMLDialogElement | null)?.showModal()
    }
    prevPct.current = pct
    prevStatus.current = ev.status
  }, [ev])

  const seatsNeededChip = useMemo(()=>{
    if (!ev) return null
    const remaining = Math.max(ev.total_seats - ev.booked_seats, 0)
    const cutoff = new Date(ev.cutoff_at)
    const now = new Date()
    if (remaining > 0 && now < cutoff) {
      return <div className="badge badge-outline">Noch {remaining} Plätze bis {cutoff.toLocaleString('de-AT')}</div>
    }
    return null
  }, [ev])
  if (!ev) return null
  return (
    <div className="space-y-4">
      <HeroMedia hero={ev.hero_media} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{ev.name}</h1>
        {ev.almostThere && <span className="badge badge-warning">Fast geschafft</span>}
      </div>
      <div className="opacity-70 text-sm">{new Date(ev.start_at).toLocaleString('de-AT')} • {ev.location}</div>
      <div className="space-y-3">
        <SegmentedProgress total={ev.total_seats} booked={ev.booked_seats} minGoal={ev.min_bookings ?? ev.total_seats} showMinLabel />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card bg-base-100 shadow p-3 flex items-center gap-3">
            <Users size={20} />
            <div>
              <div className="text-sm opacity-70">Verfügbar</div>
              <div className="font-medium">{Math.max(ev.total_seats - ev.booked_seats, 0)} Plätze</div>
            </div>
          </div>
          {(ev.seatsRemainingToMin > 0 && !ev.minReached && !ev.superPerksUnlocked) && (
            <div className="card bg-base-100 shadow p-3 flex items-center gap-3">
              <Target size={20} />
              <div>
                <div className="text-sm opacity-70">Noch</div>
                <div className="font-medium">{ev.seatsRemainingToMin} Buchungen bis zum Ziel</div>
              </div>
            </div>
          )}
          <div className="card bg-base-100 shadow p-3 flex items-center gap-3">
            <Clock3 size={20} />
            <div>
              <div className="text-sm opacity-70">Bis</div>
              <div className="font-medium">{new Date(ev.cutoff_at).toLocaleString('de-AT')}</div>
            </div>
          </div>
        </div>
        {seatsNeededChip}
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
          <button className="btn btn-primary gap-2 transition-transform active:scale-95" disabled={!!menus && !menuId} onClick={book}><ShoppingCart size={18}/> Buchen</button>
        </div>
        {message && <div className="text-sm text-warning">{message}</div>}
      </div>
      {ev.perks && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(ev.perks).map(([k,v])=> (
            <span key={k} className={`badge ${badgeColor(k)}`}>{formatPerk(k, v as any)}</span>
          ))}
        </div>
      )}

      {/* Super Perks highlight when unlocked */}
      {ev.super_perks && ev.super_perks.length > 0 && (ev.minReached || ev.superPerksUnlocked) && (
        <div className="alert alert-success">
          <div className="flex items-center gap-2">
            <PartyPopper size={20} />
            <span className="font-semibold">Super Perks freigeschaltet!</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {ev.super_perks.map((sp:string)=> (
              <span key={sp} className="badge badge-success">{sp}</span>
            ))}
          </div>
        </div>
      )}

      {/* Menu details */}
      {menus && menus.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Menüs</h2>
          {menus.map((m:any)=> (
            <div key={m.id} className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title text-md font-medium">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Utensils size={18}/><span>{m.name}</span></div>
                  <span className="opacity-70">{new Intl.NumberFormat('de-AT', { style:'currency', currency:'EUR' }).format(m.price)}</span>
                </div>
                {m.description && <div className="text-sm opacity-70 mt-1">{m.description}</div>}
              </div>
              <div className="collapse-content">
                {m.description && <p className="mb-2 opacity-80">{m.description}</p>}
                {Array.isArray(m.courses) && m.courses.length > 0 && (
                  <table className="table">
                    <thead>
                      <tr><th>Gang</th><th>Gericht</th></tr>
                    </thead>
                    <tbody>
                      {m.courses.map((c:any, idx:number)=> (
                        <tr key={idx}><td className="w-24">{c.id || idx+1}</td><td>{c.name || c}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <dialog id="confirm-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Event bestätigt 🎉</h3>
          <p className="py-4">Das Event wurde bestätigt. Bis bald!</p>
          <div className="modal-action">
            <form method="dialog"><button className="btn">OK</button></form>
          </div>
        </div>
      </dialog>
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
