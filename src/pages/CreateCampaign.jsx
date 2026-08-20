import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Link as LinkIcon, Tag } from 'lucide-react';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    subject: '',
    fromEmail: '',
    fromName: '',
    bodyHtml: '',
    bodyText: ''
  });
  const [detectedLinks, setDetectedLinks] = useState([]);
  const [linkNames, setLinkNames] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  // Automatically extract unique links whenever bodyHtml changes
  useEffect(() => {
    const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(form.bodyHtml)) !== null) {
      if (!links.includes(match[1])) {
        links.push(match[1]);
      }
    }
    setDetectedLinks(links);
  }, [form.bodyHtml]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/api/contacts?limit=1000');
      setContacts(res.data.contacts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkNameChange = (url, name) => {
    setLinkNames(prev => ({ ...prev, [url]: name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const customLinks = detectedLinks.map(url => ({
        originalUrl: url,
        name: linkNames[url] || ''
      }));

      const res = await api.post('/api/campaigns', {
        ...form,
        contactIds: selectedContacts,
        customLinks
      });
      navigate(`/campaigns/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  const toggleContact = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const insertTag = (tag) => {
    setForm(prev => ({ ...prev, bodyHtml: prev.bodyHtml + tag }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/campaigns')} className="p-2 hover:bg-gray-100 rounded-lg shrink-0" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">New Campaign</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4 sm:p-6 space-y-4">
            <div>
              <label className="label">Campaign Name</label>
              <input type="text" className="input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Subject Line</label>
              <input type="text" className="input" value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">From Email</label>
                <input type="email" className="input" value={form.fromEmail}
                  onChange={e => setForm({ ...form, fromEmail: e.target.value })} required />
              </div>
              <div>
                <label className="label">From Name</label>
                <input type="text" className="input" value={form.fromName}
                  onChange={e => setForm({ ...form, fromName: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="label mb-0">Email Body (HTML)</label>
              <div className="flex flex-wrap gap-1.5">
                {['{{firstName}}','{{lastName}}','{{email}}','{{company}}'].map(tag => (
                  <button key={tag} type="button" onClick={() => insertTag(tag)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-mono transition-colors">{tag}</button>
                ))}
              </div>
            </div>
            <textarea className="input font-mono text-xs sm:text-sm" rows={10}
              value={form.bodyHtml}
              onChange={e => setForm({ ...form, bodyHtml: e.target.value })}
              placeholder="<p>Hello {{firstName}},</p><p>Check out <a href='https://example.com/pricing'>our pricing page</a>!</p>"
              required />
            <div>
              <label className="label">Plain Text Version (optional)</label>
              <textarea className="input text-xs sm:text-sm" rows={3}
                value={form.bodyText}
                onChange={e => setForm({ ...form, bodyText: e.target.value })} />
            </div>
          </div>

          {/* Detected Links Section */}
          {detectedLinks.length > 0 && (
            <div className="card p-4 sm:p-6 border-l-4 border-blue-600 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-600 shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Detected Links in Email ({detectedLinks.length})
                  </h3>
                </div>
                <span className="text-xs text-gray-500">Give custom labels for analytics tracking</span>
              </div>
              <div className="space-y-3 pt-2">
                {detectedLinks.map((url, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2 border border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500 font-mono truncate flex-1">{url}</span>
                    </div>
                    <input
                      type="text"
                      className="input text-xs sm:text-sm py-1.5"
                      placeholder="e.g., Pricing Page Link / Buy Button"
                      value={linkNames[url] || ''}
                      onChange={e => handleLinkNameChange(url, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg mb-3">Select Recipients ({selectedContacts.length})</h3>
            <div className="max-h-64 sm:max-h-96 overflow-y-auto space-y-2 pr-1">
              {contacts.map(contact => (
                <label key={contact.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)} className="w-4 h-4 text-blue-600 rounded shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{contact.firstName} {contact.lastName}</p>
                    <p className="text-[11px] sm:text-xs text-gray-500 truncate">{contact.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving || selectedContacts.length === 0}
            className="w-full btn-primary py-3 disabled:opacity-50 text-sm font-medium">
            {saving ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}

