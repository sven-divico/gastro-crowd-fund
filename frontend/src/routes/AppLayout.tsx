import { Link, Outlet, useNavigate } from 'react-router-dom'
import { getToken, setAuthToken } from '../lib/api'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { CalendarRange, Info, Shield, LogOut } from 'lucide-react'
import { getAssetsBase } from '../lib/config'

export default function AppLayout() {
  const nav = useNavigate()
  useEffect(() => {
    const t = getToken()
    if (!t && location.pathname !== '/login') nav('/login')
  }, [])

  return (
    <div className="drawer min-h-screen">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-100 shadow">
          <div className="flex-none lg:hidden">
            <label htmlFor="app-drawer" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </label>
          </div>
          <div className="flex-1">
            <Link to="/" className="btn btn-ghost text-xl gap-2">
              <img src={`${getAssetsBase()}/media/logo-gastrocrowd.svg`} alt="Logo" className="h-6" />
              Tischlein deck di
            </Link>
          </div>
          <div className="flex-none hidden lg:flex">
            <Link className="btn btn-ghost gap-2 transition-transform active:scale-95" to="/events"><CalendarRange size={18}/> Events</Link>
            <Link className="btn btn-ghost gap-2 transition-transform active:scale-95" to="/about"><Info size={18}/> About</Link>
            <Link className="btn btn-ghost gap-2 transition-transform active:scale-95" to="/admin"><Shield size={18}/> Admin</Link>
            <button className="btn btn-ghost gap-2 transition-transform active:scale-95" onClick={() => { setAuthToken(null); nav('/login') }}><LogOut size={18}/> Logout</button>
          </div>
        </div>
        <div className="p-4"><Outlet /></div>
      </div>
      <div className="drawer-side">
        <label htmlFor="app-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-64 min-h-full bg-base-200">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/admin">Admin</Link></li>
          <li><button className="transition-transform active:scale-95" onClick={() => { setAuthToken(null); nav('/login') }}>Logout</button></li>
        </ul>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
