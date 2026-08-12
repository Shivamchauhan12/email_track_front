import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/api/contacts?limit=1000');
      setContacts(res.data.contacts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/campaigns', {
        ...form,
        contactIds: selectedContacts
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/campaigns')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">New Campaign</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
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

          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Email Body (HTML)</label>
              <div className="flex gap-2">
                {['{{firstName}}','{{lastName}}','{{email}}','{{company}}'].map(tag => (
                  <button key={tag} type="button" onClick={() => insertTag(tag)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">{tag}</button>
                ))}
              </div>
            </div>
            <textarea className="input font-mono text-sm" rows={12}
              value={form.bodyHtml}
              onChange={e => setForm({ ...form, bodyHtml: e.target.value })}
              placeholder="<p>Hello {{firstName}},</p><p>Check out <a href='https://example.com'>this link</a></p>"
              required />
            <div>
              <label className="label">Plain Text Version (optional)</label>
              <textarea className="input text-sm" rows={4}
                value={form.bodyText}
                onChange={e => setForm({ ...form, bodyText: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Select Recipients ({selectedContacts.length})</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {contacts.map(contact => (
                <label key={contact.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={selectedContacts.includes(contact.id)}
                    onChange={() => toggleContact(contact.id)} className="w-4 h-4 text-blue-600 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{contact.firstName} {contact.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving || selectedContacts.length === 0}
            className="w-full btn-primary py-3 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
