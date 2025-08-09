import React, { useState } from 'react'
import { Send, Lock } from 'lucide-react'

interface ChatComposerProps {
  onSendMessage: (content: string) => void
}

const ChatComposer: React.FC<ChatComposerProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <button
            type="button"
            onClick={() => setIsEncrypted(!isEncrypted)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
              isEncrypted ? 'glass-button text-white' : 'text-white/60'
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>Encrypt</span>
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-white/50 resize-none"
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim()}
        className="glass-button text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  )
}

export default ChatComposer
