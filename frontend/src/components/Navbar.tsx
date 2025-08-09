import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Users, MessageCircle, BarChart3 } from 'lucide-react'
import ConnectButton from './ConnectButton'
import NetworkSwitcher from './NetworkSwitcher'

const Navbar: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: '/experts', label: 'Experts', icon: Users },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Pay2Alpha</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'glass-button text-white'
                      : 'text-white/80 hover:text-white hover:glass-button'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <NetworkSwitcher />
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
