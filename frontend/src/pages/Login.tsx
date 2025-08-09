import React from 'react'
import { Shield, Lock, Zap, Users, Palette } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const { isConnected, connectWallet } = useWallet()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (isConnected) {
      navigate('/experts')
    }
  }, [isConnected, navigate])

  const features = [
    {
      icon: Lock,
      title: 'Encrypted Messages',
      description: 'All communications are encrypted and stored securely on Sapphire paratime'
    },
    {
      icon: Zap,
      title: 'Credit System',
      description: '1 credit = 1 message unlock. Pay only for what you need with USDC'
    },
    {
      icon: Users,
      title: 'Expert Network',
      description: 'Connect with verified experts across DeFi, NFTs, and Web3 domains'
    },
    {
      icon: Palette,
      title: 'Artist Registration',
      description: 'Register as an expert and monetize your knowledge in the Web3 space'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="glass-card p-6 rounded-full web3-glow pulse-blue">
              <Shield className="h-20 w-20 text-blue-400" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">
            Pay<span className="gradient-text">2</span>Alpha
          </h1>
          <p className="text-xl text-blue-100 mb-4">
            Confidential Web3 Micro-Mentorship Platform
          </p>
          <p className="text-lg text-blue-200/80 mb-8 max-w-2xl mx-auto">
            Unlock premium insights from Web3 experts through encrypted messaging. 
            Built on Base for payments and Sapphire for privacy.
          </p>
          
          {!isConnected && (
            <button
              onClick={connectWallet}
              className="glass-button text-white px-10 py-5 rounded-xl text-lg font-semibold inline-flex items-center space-x-3 web3-glow hover:pulse-blue"
            >
              <Shield className="h-6 w-6" />
              <span>Connect Wallet to Enter Web3</span>
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="glass-card p-6 rounded-xl text-center hover:web3-glow transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="glass p-4 rounded-full">
                    <Icon className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-blue-200/80 text-sm">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="glass-card p-8 rounded-xl web3-glow">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            How <span className="gradient-text">Web3 Mentorship</span> Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="glass w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 web3-glow">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Connect & Browse</h3>
              <p className="text-blue-200/80">Connect your Web3 wallet and explore verified expert profiles in DeFi, NFTs, and blockchain technology</p>
            </div>
            <div className="text-center">
              <div className="glass w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 web3-glow">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Buy Credits</h3>
              <p className="text-blue-200/80">Purchase credits with USDC on Base network to unlock premium encrypted messages from experts</p>
            </div>
            <div className="text-center">
              <div className="glass w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 web3-glow">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Chat Securely</h3>
              <p className="text-blue-200/80">Exchange encrypted messages stored on Sapphire paratime with complete privacy and confidentiality</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="glass-card p-6 rounded-xl inline-block">
            <p className="text-blue-200/80 text-sm">
              Powered by <span className="text-blue-400 font-semibold">Base</span> • 
              <span className="text-purple-400 font-semibold"> Sapphire</span> • 
              <span className="text-cyan-400 font-semibold"> IPFS</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
