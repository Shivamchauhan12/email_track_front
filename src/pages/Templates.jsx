import { useState, useEffect } from 'react';
import api from '../services/api';
import { Layout, Plus, Trash2, Edit3, Eye, Copy, Sparkles, Check } from 'lucide-react';

export default function Templates() {
  const [defaults, setDefaults] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, default, custom

  // Modal / Editor State
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Marketing',
    subject: '',
    bodyHtml: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/templates');
      setDefaults(res.data.defaults || []);
      setCustomTemplates(res.data.custom || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setForm({
      name: '',
      category: 'Marketing',
      subject: '',
      bodyHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color: #2563eb;">Hello {{firstName}},</h2>
  <p>Write your beautiful email content here...</p>
  <div style="margin: 20px 0;">
    <a href="https://example.com" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Call To Action</a>
  </div>
</div>
      `.trim()
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      category: t.category || 'Custom',
      subject: t.subject || '',
      bodyHtml: t.bodyHtml || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate && !String(editingTemplate.id).startsWith('default-')) {
        await api.put(`/api/templates/${editingTemplate.id}`, form);
      } else {
        await api.post('/api/templates', form);
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this custom template?')) return;
    try {
      await api.delete(`/api/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      alert('Failed to delete template');
    }
  };

  const insertTag = (tag) => {
    setForm(prev => ({ ...prev, bodyHtml: prev.bodyHtml + ' ' + tag }));
  };

  const allTemplates = [...defaults, ...customTemplates];
  const displayedTemplates = activeTab === 'default' 
    ? defaults 
    : activeTab === 'custom' 
    ? customTemplates 
    : allTemplates;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            Email Templates
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create, edit, and select responsive HTML email templates for your campaigns.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          Create New Template
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'all', label: `All Templates (${allTemplates.length})` },
          { id: 'default', label: `Starter Templates (${defaults.length})` },
          { id: 'custom', label: `My Templates (${customTemplates.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading templates...</div>
      ) : displayedTemplates.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-sm">No templates found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayedTemplates.map((t) => {
            const isDefault = String(t.id).startsWith('default-');
            return (
              <div
                key={t.id}
                className="card flex flex-col justify-between p-5 hover:shadow-md transition-shadow relative border border-gray-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800">
                      {t.category || 'General'}
                    </span>
                    {isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-amber-50 text-amber-700 border border-amber-200">
                        <Sparkles className="w-3 h-3" /> Starter
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{t.name}</h3>
                  {t.subject && (
                    <p className="text-xs text-gray-500 truncate mb-3">
                      <span className="font-medium text-gray-700">Subject:</span> {t.subject}
                    </p>
                  )}

                  {/* HTML Preview Box */}
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 max-h-40 overflow-hidden text-xs font-mono text-gray-600 relative opacity-90 select-none">
                    <div
                      className="pointer-events-none transform scale-90 origin-top-left"
                      dangerouslySetInnerHTML={{ __html: t.bodyHtml }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setPreviewTemplate(t)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-medium py-1 px-2 rounded hover:bg-gray-100"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium py-1 px-2.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isDefault ? 'Use & Customize' : 'Edit'}
                    </button>

                    {!isDefault && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-auto border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                {editingTemplate ? `Edit Template` : 'Create Custom Template'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Template Name</label>
                  <input
                    type="text"
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Monthly Newsletter Template"
                    required
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Promotional">Promotional</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Default Subject Line (optional)</label>
                <input
                  type="text"
                  className="input"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Exciting update for {{firstName}}"
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="label mb-0">Template HTML Code</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['{{firstName}}', '{{lastName}}', '{{email}}', '{{company}}'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertTag(tag)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-mono transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="input font-mono text-xs sm:text-sm"
                  rows={14}
                  value={form.bodyHtml}
                  onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })}
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm py-2 px-5 font-medium">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col my-auto border border-gray-200">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{previewTemplate.name}</h3>
                <p className="text-xs text-gray-500">Subject: {previewTemplate.subject || 'N/A'}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <div
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto min-h-[300px]"
                dangerouslySetInnerHTML={{
                  __html: previewTemplate.bodyHtml
                    .replace(/{{firstName}}/g, 'John')
                    .replace(/{{lastName}}/g, 'Doe')
                    .replace(/{{email}}/g, 'john@example.com')
                    .replace(/{{company}}/g, 'Acme Corp')
                }}
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="btn-primary text-sm py-2 px-4"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
