import { useState } from 'react'
import { api, setAuthToken } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const { data } = await api.post('/auth', { password })
      setAuthToken(data.token)
      nav('/')
    } catch (e) {
      setError('Falsches Passwort')
    }
  }
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="password" placeholder="Passwort" className="input input-bordered w-full" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-error text-sm">{error}</div>}
        <button className="btn btn-primary w-full">Anmelden</button>
      </form>
    </div>
  )
}

