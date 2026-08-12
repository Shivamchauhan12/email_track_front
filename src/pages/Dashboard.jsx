import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Users, Eye, MousePointer, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/analytics/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  const statCards = [
    { label: 'Total Campaigns', value: stats.totalCampaigns, icon: Mail, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Contacts', value: stats.totalContacts, icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Emails Sent', value: stats.totalSent, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Opens', value: stats.totalOpens, icon: Eye, color: 'bg-orange-100 text-orange-600' },
    { label: 'Total Clicks', value: stats.totalClicks, icon: MousePointer, color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Campaigns</h3>
          <Link to="/campaigns" className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Recipients</th>
                <th className="px-4 py-3">Open Rate</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCampaigns.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/campaigns/${c.id}`} className="text-blue-600 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === 'SENT' ? 'bg-green-100 text-green-700' :
                      c.status === 'SENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.stats.totalRecipients}</td>
                  <td className="px-4 py-3">{c.stats.openRate}%</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
