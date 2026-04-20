import React, { useEffect, useState } from 'react'
import Chat from './components/Chat'
import { healthCheck } from './services/api'
import './App.css'

export default function App() {
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    const checkBackend = async () => {
      const status = await healthCheck()
      setBackendStatus(status ? 'connected' : 'disconnected')
    }
    checkBackend()
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <Chat />
      <div className={`status-indicator status-${backendStatus}`}>
        {backendStatus === 'connected' ? '✓ Connected' : '✗ Disconnected'}
      </div>
    </div>
  )
}
