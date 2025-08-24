import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const initialFields: { [key: string]: { id: string; name: string; type: string }[] } = {
  deals: [
    { id: '1', name: 'Source', type: 'Text' },
    { id: '2', name: 'Contract Value', type: 'Number' }
  ],
  contacts: [
    { id: '1', name: 'LinkedIn', type: 'Text' }
  ],
  companies: [
    { id: '1', name: 'Industry', type: 'Text' }
  ]
};

const entityTypes: { key: string; label: string }[] = [
  { key: 'deals', label: 'Deals' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'companies', label: 'Companies' }
];

const fieldTypes: string[] = ['Text', 'Number', 'Date', 'Dropdown'];

const CustomFields: React.FC = () => {
  const [activeTab, setActiveTab] = useState('deals');
  const [fields, setFields] = useState(initialFields);
  const [newField, setNewField] = useState({ name: '', type: 'Text' });

  const handleAdd = () => {
    setFields(prev => ({
      ...prev,
      [activeTab]: [
        ...prev[activeTab],
        { id: Date.now().toString(), name: newField.name, type: newField.type }
      ]
    }));
    setNewField({ name: '', type: 'Text' });
    // Log: Field added
  };

  const handleDelete = (id: string) => {
    setFields(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(f => f.id !== id)
    }));
    // Log: Field deleted
  };

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <Tag className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-semibold text-white">Custom Fields</h3>
      </div>
      <div className="mb-4 flex gap-2">
        {entityTypes.map((entity: { key: string; label: string }) => (
          <Button
            key={entity.key}
            onClick={() => setActiveTab(entity.key)}
            variant={activeTab === entity.key ? 'gradient' : 'secondary'}
            size="md"
            className="px-4 py-2"
          >
            {entity.label}
          </Button>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Field name"
          value={newField.name}
          onChange={e => setNewField({ ...newField, name: e.target.value })}
          className="px-3 py-2 rounded-md bg-secondary-800 text-white border border-secondary-600 focus:outline-none"
        />
        <select
          value={newField.type}
          onChange={e => setNewField({ ...newField, type: e.target.value })}
          className="px-3 py-2 rounded-md bg-secondary-800 text-white border border-secondary-600 focus:outline-none"
        >
          {fieldTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}
        </select>
        <Button
          onClick={handleAdd}
          disabled={!newField.name}
          variant="gradient"
          size="md"
          icon={Plus}
          className="px-4 py-2"
        >
          Add
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-secondary-400">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields[activeTab].map(field => (
              <tr key={field.id} className="border-b border-secondary-700">
                <td className="p-2">{field.name}</td>
                <td className="p-2">{field.type}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(field.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CustomFields; 