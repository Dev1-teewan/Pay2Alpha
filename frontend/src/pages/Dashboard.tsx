import React from 'react'
import { TrendingUp, Users, MessageCircle, DollarSign, Activity, Award } from 'lucide-react'
import ClaimButton from '../components/ClaimButton'
import RefundButton from '../components/RefundButton'

const Dashboard: React.FC = () => {
  // Mock data - in real app, this would come from blockchain
  const stats = {
    totalCredits: 25,
    usedCredits: 12,
    totalSpent: 420,
    expertsConnected: 8,
    messagesExchanged: 34,
    avgRating: 4.8
  }

  const recentActivity = [
    {
      id: '1',
      type: 'message',
      description: 'Revealed message from Sarah Chen',
      timestamp: new Date(Date.now() - 1800000),
      cost: 50
    },
    {
      id: '2',
      type: 'purchase',
      description: 'Purchased 10 credits',
      timestamp: new Date(Date.now() - 3600000),
      cost: 350
    },
    {
      id: '3',
      type: 'message',
      description: 'Revealed message from Marcus Rodriguez',
      timestamp: new Date(Date.now() - 7200000),
      cost: 35
    }
  ]

  const topExperts = [
    {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
      messagesExchanged: 8,
      totalSpent: 400
    },
    {
      name: 'Dr. Emily Watson',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face',
      messagesExchanged: 5,
      totalSpent: 375
    },
    {
      name: 'Alex Kim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      messagesExchanged: 12,
      totalSpent: 480
    }
  ]

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/70">Track your mentorship journey and manage credits</p>
          </div>
          <div className="flex space-x-3">
            <ClaimButton />
            <RefundButton />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Available Credits</p>
                <p className="text-2xl font-bold text-white">{stats.totalCredits - stats.usedCredits}</p>
              </div>
              <div className="glass p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-white">${stats.totalSpent}</p>
              </div>
              <div className="glass p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Experts Connected</p>
                <p className="text-2xl font-bold text-white">{stats.expertsConnected}</p>
              </div>
              <div className="glass p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Messages Exchanged</p>
                <p className="text-2xl font-bold text-white">{stats.messagesExchanged}</p>
              </div>
              <div className="glass p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Average Rating</p>
                <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
              </div>
              <div className="glass p-3 rounded-full">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Credits Used</p>
                <p className="text-2xl font-bold text-white">{stats.usedCredits}/{stats.totalCredits}</p>
              </div>
              <div className="glass p-3 rounded-full">
                <Activity className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="glass p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'message' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <div>
                      <p className="text-white text-sm">{activity.description}</p>
                      <p className="text-white/60 text-xs">{activity.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm font-medium">
                    ${activity.cost}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Experts */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Top Experts</h2>
            <div className="space-y-4">
              {topExperts.map((expert, index) => (
                <div key={index} className="glass p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">{expert.name}</p>
                      <p className="text-white/60 text-xs">{expert.messagesExchanged} messages</p>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm font-medium">
                    ${expert.totalSpent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
