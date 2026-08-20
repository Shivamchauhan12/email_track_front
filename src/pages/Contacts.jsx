import { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Upload, Search } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', firstName: '', lastName: '', company: '', tags: '' });
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [search]);

  const fetchContacts = async () => {
    try {
      const res = await api.get(`/api/contacts?search=${search}&limit=100`);
      setContacts(res.data.contacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/contacts', newContact);
      setNewContact({ email: '', firstName: '', lastName: '', company: '', tags: '' });
      setShowAdd(false);
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add contact');
    }
  };

  const handleBulk = async (e) => {
    e.preventDefault();
    try {
      const lines = bulkText.trim().split('\n');
      const contacts = lines.map(line => {
        const [email, firstName, lastName, company, tags] = line.split(',').map(s => s.trim());
        return { email, firstName, lastName, company, tags };
      }).filter(c => c.email);
      const res = await api.post('/api/contacts/bulk', { contacts });
      alert(`Created: ${res.data.created}, Skipped: ${res.data.skipped}`);
      setShowBulk(false);
      setBulkText('');
      fetchContacts();
    } catch (err) {
      alert('Bulk import failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await api.delete(`/api/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contacts</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => setShowBulk(true)} className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm py-2">
            <Upload className="w-4 h-4 shrink-0" /> <span className="truncate">Bulk Import</span>
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm py-2">
            <Plus className="w-4 h-4 shrink-0" /> <span className="truncate">Add Contact</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search contacts..." className="input pl-10 text-xs sm:text-sm"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {showAdd && (
        <div className="card p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-4">Add Contact</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input type="email" placeholder="Email *" className="input text-xs sm:text-sm" required
              value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
            <input type="text" placeholder="First Name" className="input text-xs sm:text-sm"
              value={newContact.firstName} onChange={e => setNewContact({...newContact, firstName: e.target.value})} />
            <input type="text" placeholder="Last Name" className="input text-xs sm:text-sm"
              value={newContact.lastName} onChange={e => setNewContact({...newContact, lastName: e.target.value})} />
            <input type="text" placeholder="Company" className="input text-xs sm:text-sm"
              value={newContact.company} onChange={e => setNewContact({...newContact, company: e.target.value})} />
            <input type="text" placeholder="Tags (comma separated)" className="input text-xs sm:text-sm"
              value={newContact.tags} onChange={e => setNewContact({...newContact, tags: e.target.value})} />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <button type="submit" className="btn-primary flex-1 text-xs sm:text-sm py-2">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1 text-xs sm:text-sm py-2">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showBulk && (
        <div className="card p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-1">Bulk Import</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">Format: email, firstName, lastName, company, tags (one per line)</p>
          <form onSubmit={handleBulk} className="space-y-4">
            <textarea className="input font-mono text-xs sm:text-sm" rows={5} value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="john@example.com, John, Doe, Acme Inc, lead&#10;jane@example.com, Jane, Smith, Tech Corp, customer" />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-xs sm:text-sm py-2 px-6">Import</button>
              <button type="button" onClick={() => setShowBulk(false)} className="btn-secondary text-xs sm:text-sm py-2 px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-4 sm:p-6 overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-xs sm:text-sm text-left min-w-[600px]">
            <thead className="text-[11px] sm:text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3">Name</th>
                <th className="px-3 sm:px-4 py-3">Email</th>
                <th className="px-3 sm:px-4 py-3">Company</th>
                <th className="px-3 sm:px-4 py-3">Tags</th>
                <th className="px-3 sm:px-4 py-3">Campaigns</th>
                <th className="px-3 sm:px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">{c.firstName} {c.lastName}</td>
                  <td className="px-3 sm:px-4 py-3 font-mono text-xs">{c.email}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{c.company || '-'}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags?.split(',').map(tag => (
                        <span key={tag} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] sm:text-xs rounded-full">{tag.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{c._count.campaigns}</td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
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

