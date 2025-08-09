import React, { useState } from 'react'
import { X, User, DollarSign, Tag, FileText, Palette } from 'lucide-react'

interface ArtistRegistrationFormProps {
  onClose: () => void
}

const ArtistRegistrationForm: React.FC<ArtistRegistrationFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    expertise: [] as string[],
    pricePerMessage: 50,
    portfolioUrl: '',
    twitterHandle: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const expertiseOptions = [
    'DeFi', 'NFTs', 'Smart Contracts', 'Tokenomics', 'Trading', 'TA',
    'Gaming', 'Metaverse', 'DAO Governance', 'Research', 'Academia',
    'NFT Art', 'Digital Assets', 'Creator Economy', 'Risk Management'
  ]

  const handleExpertiseToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(skill)
        ? prev.expertise.filter(s => s !== skill)
        : [...prev.expertise, skill]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Mock implementation - in real app, this would call the smart contract
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Successfully registered as an expert! Your profile will be reviewed and activated within 24 hours.')
      onClose()
    } catch (error) {
      console.error('Failed to register:', error)
      alert('Failed to register. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto web3-glow">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="glass p-2 rounded-full">
              <Palette className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Register as Web3 Expert</h2>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200/60 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-blue-200/80 text-sm font-medium mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Expert Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-blue-200/50"
              placeholder="Your professional name"
            />
          </div>

          <div>
            <label className="block text-blue-200/80 text-sm font-medium mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Bio & Expertise Description
            </label>
            <textarea
              required
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-blue-200/50 resize-none"
              rows={4}
              placeholder="Describe your background, experience, and what makes you an expert in your field..."
            />
          </div>

          <div>
            <label className="block text-blue-200/80 text-sm font-medium mb-3">
              <Tag className="h-4 w-4 inline mr-2" />
              Areas of Expertise (Select up to 5)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {expertiseOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleExpertiseToggle(skill)}
                  disabled={!formData.expertise.includes(skill) && formData.expertise.length >= 5}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.expertise.includes(skill)
                      ? 'glass-button text-white web3-glow'
                      : 'glass text-blue-200/70 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <p className="text-blue-200/60 text-xs mt-2">
              Selected: {formData.expertise.length}/5
            </p>
          </div>

          <div>
            <label className="block text-blue-200/80 text-sm font-medium mb-2">
              <DollarSign className="h-4 w-4 inline mr-2" />
              Price per Message (USDC)
            </label>
            <input
              type="number"
              required
              min="1"
              max="1000"
              value={formData.pricePerMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerMessage: parseInt(e.target.value) }))}
              className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-blue-200/50"
              placeholder="50"
            />
            <p className="text-blue-200/60 text-xs mt-1">
              Recommended: $25-$100 based on your expertise level
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-200/80 text-sm font-medium mb-2">
                Portfolio/Website URL
              </label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-blue-200/50"
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div>
              <label className="block text-blue-200/80 text-sm font-medium mb-2">
                Twitter Handle
              </label>
              <input
                type="text"
                value={formData.twitterHandle}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-blue-200/50"
                placeholder="@yourusername"
              />
            </div>
          </div>

          <div className="glass p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Registration Requirements:</h3>
            <ul className="text-blue-200/80 text-sm space-y-1">
              <li>• Wallet verification and identity confirmation</li>
              <li>• Portfolio review by our expert committee</li>
              <li>• Minimum 2 years of relevant Web3 experience</li>
              <li>• Commitment to provide quality mentorship</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || formData.expertise.length === 0}
            className="w-full glass-button text-white px-6 py-4 rounded-lg font-medium web3-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registering...' : 'Register as Expert'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ArtistRegistrationForm
