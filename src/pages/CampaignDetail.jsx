import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Send, Users, Eye, MousePointer, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await api.get(`/api/campaigns/${id}`);
      setCampaign(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirm('Send this campaign now?')) return;
    try {
      await api.post(`/api/campaigns/${id}/send`);
      alert('Campaign sending started!');
      fetchCampaign();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!campaign) return <div className="text-center py-12">Campaign not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/campaigns')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
            <p className="text-gray-500">{campaign.subject}</p>
          </div>
        </div>
        {campaign.status === 'DRAFT' && (
          <button onClick={handleSend} className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Now
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Recipients</p>
              <p className="text-xl font-bold">{campaign.stats.totalRecipients}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Opens</p>
              <p className="text-xl font-bold">{campaign.stats.uniqueOpens} ({campaign.stats.openRate}%)</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <MousePointer className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Clicks</p>
              <p className="text-xl font-bold">{campaign.stats.uniqueClickers} ({campaign.stats.clickRate}%)</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-xl font-bold">{campaign.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Recipients</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr><th className="px-3 py-2">Contact</th><th className="px-3 py-2">Sent</th><th className="px-3 py-2">Opened</th><th className="px-3 py-2">Clicks</th></tr>
              </thead>
              <tbody>
                {campaign.contacts.map(cc => (
                  <tr key={cc.id} className="border-b">
                    <td className="px-3 py-2">
                      <p className="font-medium">{cc.contact.firstName} {cc.contact.lastName}</p>
                      <p className="text-xs text-gray-500">{cc.contact.email}</p>
                    </td>
                    <td className="px-3 py-2">{cc.sentAt ? format(new Date(cc.sentAt), 'MMM d, HH:mm') : '-'}</td>
                    <td className="px-3 py-2">
                      {cc.openedAt ? (
                        <span className="text-green-600 font-medium">{cc.openCount}x &middot; {format(new Date(cc.openedAt), 'MMM d')}</span>
                      ) : (<span className="text-gray-400">Not opened</span>)}
                    </td>
                    <td className="px-3 py-2">
                      {cc.clicks.length > 0 ? (
                        <span className="text-blue-600 font-medium">{cc.clicks.length}x</span>
                      ) : (<span className="text-gray-400">-</span>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Tracked Links</h3>
          <div className="space-y-3">
            {campaign.links.map(link => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{link.originalUrl}</p>
                  <p className="text-xs text-gray-500">Code: {link.trackingCode}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MousePointer className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{link._count.clicks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
