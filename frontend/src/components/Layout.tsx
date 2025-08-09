import React, { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      {/* Web3 Floating Orbs */}
      <div className="web3-orb web3-orb-1"></div>
      <div className="web3-orb web3-orb-2"></div>
      <div className="web3-orb web3-orb-3"></div>
      
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
    </div>
  )
}

export default Layout
