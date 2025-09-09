import axios from 'axios'

const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: apiBase,
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('demo_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('demo_token')
  }
}

export function getToken(): string | null {
  return localStorage.getItem('demo_token')
}

