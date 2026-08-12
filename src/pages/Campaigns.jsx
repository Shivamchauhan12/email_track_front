import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Send, Trash2, Eye } from 'lucide-react';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/api/campaigns');
      setCampaigns(res.data.campaigns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/api/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleSend = async (id) => {
    if (!confirm('Send this campaign now?')) return;
    try {
      await api.post(`/api/campaigns/${id}/send`);
      alert('Campaign sending started!');
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
        <Link to="/campaigns/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      <div className="grid gap-4">
        {campaigns.map((c) => (
          <div key={c.id} className="card flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg">{c.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  c.status === 'SENT' ? 'bg-green-100 text-green-700' :
                  c.status === 'SENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{c.subject}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>{c.stats.totalRecipients} recipients</span>
                <span>{c.stats.uniqueOpens} opens ({c.stats.openRate}%)</span>
                <span>{c._count.links} links</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/campaigns/${c.id}`}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </Link>
              {c.status === 'DRAFT' && (
                <button
                  onClick={() => handleSend(c.id)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Send Campaign"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
