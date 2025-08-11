import React from 'react';

interface DealModalProps {
  form: {
    id?: string;
    title: string;
    value: number;
    description?: string;
    probability: number;
    pipeline_id: string;
    stage_id: string;
    status: string;
    expected_close_date: string;
    priority: string;
    tags: string;
    company_id: string;
    contact_id: string;
  };
  setForm: (f: any) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  editing?: boolean;
  pipelines: { id: string; name: string }[];
  stages: { id: string; name: string }[];
  pipelinesLoading: boolean;
  stagesLoading: boolean;
  onPipelineChange: (pipelineId: string) => void;
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  companiesLoading: boolean;
  contactsLoading: boolean;
}

const DealModal: React.FC<DealModalProps> = ({ form, setForm, onSave, onCancel, saving, editing, pipelines, stages, pipelinesLoading, stagesLoading, onPipelineChange, companies, contacts, companiesLoading, contactsLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Deal' : 'Add Deal'}</h2>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm((prev: any) => ({ ...prev, title: e.target.value }))}
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Deal Title"
        />
        <input
          type="number"
          value={form.value}
          onChange={e => setForm((prev: any) => ({ ...prev, value: Number(e.target.value) }))}
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Deal Value"
          min={0}
        />
        <input
          type="number"
          value={form.probability}
          onChange={e => setForm((prev: any) => ({ ...prev, probability: Math.max(0, Math.min(100, Number(e.target.value))) }))}
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Probability (%)"
          min={0}
          max={100}
        />
        <textarea
          value={form.description || ''}
          onChange={e => setForm((prev: any) => ({ ...prev, description: e.target.value }))}
          className="w-full border px-3 py-2 mb-4 rounded"
          placeholder="Description"
        />
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Pipeline</label>
          {pipelinesLoading ? (
            <div>Loading pipelines...</div>
          ) : (
            <select
              value={form.pipeline_id}
              onChange={e => {
                setForm((prev: any) => ({ ...prev, pipeline_id: e.target.value, stage_id: '' }));
                onPipelineChange(e.target.value);
              }}
              className="w-full border px-3 py-2 rounded"
              disabled={saving}
            >
              <option value="">Select pipeline</option>
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Stage</label>
          {stagesLoading ? (
            <div>Loading stages...</div>
          ) : (
            <select
              value={form.stage_id}
              onChange={e => setForm((prev: any) => ({ ...prev, stage_id: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              disabled={saving || !form.pipeline_id}
            >
              <option value="">Select stage</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => setForm((prev: any) => ({ ...prev, status: e.target.value }))}
            className="w-full border px-3 py-2 rounded"
            disabled={saving}
          >
            <option value="open">Open</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Expected Close Date</label>
          <input
            type="date"
            value={form.expected_close_date}
            onChange={e => setForm((prev: any) => ({ ...prev, expected_close_date: e.target.value }))}
            className="w-full border px-3 py-2 rounded"
            disabled={saving}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={e => setForm((prev: any) => ({ ...prev, priority: e.target.value }))}
            className="w-full border px-3 py-2 rounded"
            disabled={saving}
          >
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => setForm((prev: any) => ({ ...prev, tags: e.target.value }))}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. Hot, Priority, Follow-up"
            disabled={saving}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Company</label>
          {companiesLoading ? (
            <div>Loading companies...</div>
          ) : (
            <select
              value={form.company_id}
              onChange={e => setForm((prev: any) => ({ ...prev, company_id: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              disabled={saving}
            >
              <option value="">Select company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Contact</label>
          {contactsLoading ? (
            <div>Loading contacts...</div>
          ) : (
            <select
              value={form.contact_id}
              onChange={e => setForm((prev: any) => ({ ...prev, contact_id: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              disabled={saving}
            >
              <option value="">Select contact</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded" disabled={saving}>Cancel</button>
          <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={!form.title.trim() || !form.pipeline_id || !form.stage_id || saving}>
            {saving ? (editing ? 'Saving...' : 'Saving...') : (editing ? 'Save Changes' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealModal; 