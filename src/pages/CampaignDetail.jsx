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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/campaigns')} className="p-2 hover:bg-gray-100 rounded-lg shrink-0" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{campaign.name}</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{campaign.subject}</p>
          </div>
        </div>
        {campaign.status === 'DRAFT' && (
          <button onClick={handleSend} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm shrink-0">
            <Send className="w-4 h-4" />
            Send Now
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-3.5 sm:p-5">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Recipients</p>
              <p className="text-lg sm:text-xl font-bold">{campaign.stats.totalRecipients}</p>
            </div>
          </div>
        </div>
        <div className="card p-3.5 sm:p-5">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-green-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Opens</p>
              <p className="text-lg sm:text-xl font-bold">{campaign.stats.uniqueOpens} ({campaign.stats.openRate}%)</p>
            </div>
          </div>
        </div>
        <div className="card p-3.5 sm:p-5">
          <div className="flex items-center gap-3">
            <MousePointer className="w-5 h-5 text-purple-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Clicks</p>
              <p className="text-lg sm:text-xl font-bold">{campaign.stats.uniqueClickers} ({campaign.stats.clickRate}%)</p>
            </div>
          </div>
        </div>
        <div className="card p-3.5 sm:p-5">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Status</p>
              <p className="text-lg sm:text-xl font-bold truncate">{campaign.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-4">Recipients</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[550px]">
              <thead className="text-[11px] sm:text-xs text-gray-500 uppercase bg-gray-50">
                <tr><th className="px-3 py-2 text-left">Contact</th><th className="px-3 py-2 text-left">Sent</th><th className="px-3 py-2 text-left">Opened</th><th className="px-3 py-2 text-left">Clicks</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaign.contacts.map(cc => (
                  <tr key={cc.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{cc.contact.firstName} {cc.contact.lastName}</p>
                        {cc.contact.company && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold border border-blue-100">
                            🏢 {cc.contact.company}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{cc.contact.email}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {cc.sentAt ? format(new Date(cc.sentAt), 'MMM d, HH:mm') : '-'}
                    </td>
                    <td className="px-3 py-3">
                      {cc.openedAt ? (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-medium inline-block whitespace-nowrap">
                          {cc.openCount} {cc.openCount === 1 ? 'open' : 'opens'} &middot; {format(new Date(cc.openedAt), 'MMM d')}
                        </span>
                      ) : (<span className="text-xs text-gray-400">Not opened</span>)}
                    </td>
                    <td className="px-3 py-3">
                      {cc.clicks && cc.clicks.length > 0 ? (
                        <div className="space-y-1 max-w-xs">
                          {cc.clicks.map(click => (
                            <div key={click.id} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 flex items-center justify-between gap-2">
                              <span className="font-semibold truncate max-w-[140px]" title={click.link.name || click.link.originalUrl}>
                                🔗 {click.link.name || click.link.originalUrl}
                              </span>
                              <span className="font-bold bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                {click.clickCount || 1} {click.clickCount === 1 ? 'click' : 'clicks'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (<span className="text-xs text-gray-400">No clicks</span>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-4">Tracked Links</h3>
          <div className="space-y-3">
            {campaign.links.map(link => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                    {link.name || link.originalUrl}
                  </p>
                  {link.name && (
                    <p className="text-[11px] sm:text-xs text-gray-500 truncate font-mono">{link.originalUrl}</p>
                  )}
                  <p className="text-[11px] sm:text-xs text-gray-400">Code: {link.trackingCode}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-purple-50 px-2.5 py-1 rounded-md text-purple-700 shrink-0">
                  <MousePointer className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-bold">{link._count ? link._count.clicks : (link.clickCount || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

