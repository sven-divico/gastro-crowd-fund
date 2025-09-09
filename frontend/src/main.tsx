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

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <Events /> },
      { path: '/login', element: <Login /> },
      { path: '/event/:eventId', element: <EventDetail /> },
      { path: '/about', element: <About /> },
      { path: '/admin', element: <Admin /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

