import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import AppLayout from './routes/AppLayout'
import Login from './routes/Login'
import Events from './routes/Events'
import EventDetail from './routes/EventDetail'
import About from './routes/About'
import Admin from './routes/Admin'
import Landing from './routes/Landing'
import { loadRuntimeConfig } from './lib/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/events', element: <Events /> },
      { path: '/login', element: <Login /> },
      { path: '/event/:eventId', element: <EventDetail /> },
      { path: '/about', element: <About /> },
      { path: '/admin', element: <Admin /> },
    ],
  },
])

async function bootstrap(){
  await loadRuntimeConfig()
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  )
}

bootstrap()
