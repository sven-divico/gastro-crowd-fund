import { Link, Outlet, useNavigate } from 'react-router-dom'
import { getToken, setAuthToken } from '../lib/api'
import { useEffect } from 'react'

export default function AppLayout() {
  const nav = useNavigate()
  useEffect(() => {
    const t = getToken()
    if (!t && location.pathname !== '/login') nav('/login')
  }, [])

  return (
    <div className="min-h-screen">
      <div className="navbar bg-base-100 shadow">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">GastroCrowd</Link>
        </div>
        <div className="flex-none">
          <Link className="btn btn-ghost" to="/about">About</Link>
          <Link className="btn btn-ghost" to="/admin">Admin</Link>
          <button className="btn btn-ghost" onClick={() => { setAuthToken(null); nav('/login') }}>Logout</button>
        </div>
      </div>
      <div className="p-4"><Outlet /></div>
    </div>
  )
}

