import React, { useState } from 'react'
import { Eye, Clock, CheckCircle, RefreshCw, Shield } from 'lucide-react'

interface Record {
  id: string
  timestamp: Date
  ipfsCid: string
  isRevealed: boolean
  creditsUsed: number
}

interface RecordListProps {
  expertId: string
}

const RecordList: React.FC<RecordListProps> = ({ expertId }) => {
  const [records] = useState<Record[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000),
      ipfsCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      isRevealed: true,
      creditsUsed: 1
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1800000),
      ipfsCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
      isRevealed: false,
      creditsUsed: 0
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 900000),
      ipfsCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI',
      isRevealed: false,
      creditsUsed: 0
    }
  ])

  const handleReveal = (recordId: string) => {
    console.log(`Revealing record ${recordId}`)
    // Mock implementation - in real app, this would call SIWE + getSecretKey + decrypt
    alert('Message revealed! (Mock implementation)')
  }

  return (
    <div className="glass-card p-6 rounded-xl web3-glow">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="h-5 w-5 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Encrypted Records</h3>
      </div>
      
      <div className="space-y-3">
        {records.map((record) => (
          <div key={record.id} className="glass p-4 rounded-lg flex items-center justify-between border border-blue-400/20">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                record.isRevealed ? 'bg-green-400' : 'bg-blue-400 pulse-blue'
              }`}></div>
              <div>
                <p className="text-white text-sm font-medium">
                  IPFS: {record.ipfsCid.slice(0, 20)}...
                </p>
                <div className="flex items-center space-x-2 text-blue-200/60 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{record.timestamp.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {record.isRevealed ? (
                <div className="flex items-center space-x-1 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Revealed</span>
                </div>
              ) : (
                <button
                  onClick={() => handleReveal(record.id)}
                  className="glass-button text-white px-3 py-1 rounded text-sm flex items-center space-x-1 web3-glow"
                >
                  <Eye className="h-3 w-3" />
                  <span>Reveal</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 glass p-3 rounded-lg">
        <p className="text-blue-200/70 text-xs">
          Records are encrypted and stored on Sapphire paratime for maximum privacy
        </p>
      </div>
    </div>
  )
}

export default RecordList
