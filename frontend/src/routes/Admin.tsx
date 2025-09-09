import { useEffect, useState } from 'react'
import { api, getToken, setAuthToken } from '../lib/api'
import { RotateCcw } from 'lucide-react'

export default function Admin(){
  const [events, setEvents] = useState<any[]>([])
  useEffect(()=>{
    const t = getToken(); if (t) setAuthToken(t)
    api.get('/events').then(r=>setEvents(r.data.items))
  },[])
  const reset = async () => {
    const t = getToken(); if (t) setAuthToken(t)
    await api.post('/admin/reset')
    const r = await api.get('/events')
    setEvents(r.data.items)
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <button className="btn btn-outline gap-2 transition-transform active:scale-95" onClick={reset}><RotateCcw size={18}/> Reset Bookings</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr><th>ID</th><th>Name</th><th>Booked/Total</th><th>Status</th></tr></thead>
          <tbody>
            {events.map(e=> (
              <tr key={e.id}><td>{e.id}</td><td>{e.name}</td><td>{e.booked_seats}/{e.total_seats}</td><td>{e.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
