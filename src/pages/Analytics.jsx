import { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function Analytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/api/campaigns');
      setCampaigns(res.data.campaigns);
      if (res.data.campaigns.length > 0) setSelectedCampaign(String(res.data.campaigns[0].id));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedCampaign) fetchAnalytics(); }, [selectedCampaign]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/api/analytics/campaign/${selectedCampaign}`);
      setAnalytics(res.data);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  const engagementData = analytics ? [
    { name: 'Opened', value: analytics.engagement.opened },
    { name: 'Not Opened', value: analytics.engagement.notOpened },
    { name: 'Clicked', value: analytics.engagement.clicked },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" /> Analytics
        </h2>
        <select className="input w-64" value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-sm text-gray-500">Recipients</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.engagement.totalRecipients}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Open Rate</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.engagement.openRate}%</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Click Rate</p>
              <p className="text-3xl font-bold text-green-600">{analytics.engagement.clickRate}%</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Total Clicks</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.clicksByLink.reduce((sum, l) => sum + l.clicks, 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Opens Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.opensByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">Engagement Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={engagementData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {engagementData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Link Performance</h3>
            <div className="space-y-4">
              {analytics.clicksByLink.map(link => (
                <div key={link.id || link.url} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {link.name || link.url}
                      </p>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {link.clicks} {link.clicks === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>
                    {link.name && link.name !== link.url && (
                      <p className="text-xs text-gray-500 font-mono truncate mb-1.5">{link.url}</p>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${analytics.engagement.totalRecipients > 0 ? Math.min(100, (link.clicks / analytics.engagement.totalRecipients) * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
