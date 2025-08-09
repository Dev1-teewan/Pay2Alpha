import React from 'react'
import { Network } from 'lucide-react'
import { useNetwork } from '../contexts/NetworkContext'

const NetworkSwitcher: React.FC = () => {
  const { currentNetwork, switchNetwork } = useNetwork()

  return (
    <div className="flex items-center space-x-2">
      <Network className="h-4 w-4 text-white" />
      <select
        value={currentNetwork}
        onChange={(e) => switchNetwork(e.target.value as 'base' | 'sapphire')}
        className="glass-input text-white bg-transparent px-3 py-1 rounded-lg text-sm focus:outline-none"
      >
        <option value="base" className="bg-gray-800">Base</option>
        <option value="sapphire" className="bg-gray-800">Sapphire</option>
      </select>
    </div>
  )
}

export default NetworkSwitcher
