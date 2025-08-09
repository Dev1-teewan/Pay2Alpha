import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import { NetworkProvider } from './contexts/NetworkContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Experts from './pages/Experts'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <WalletProvider>
      <NetworkProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/chat/:expertId" element={<Chat />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </NetworkProvider>
    </WalletProvider>
  )
}

export default App
