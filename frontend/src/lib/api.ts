import axios from 'axios'
import { getConfig } from './config'

export const api = axios.create({
  baseURL: getConfig().apiBase,
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
