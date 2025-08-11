import React, { useState } from 'react';
import { List, Search } from 'lucide-react';
import Card from '../ui/Card';

const initialLogs = [
  { id: '1', date: '2024-06-20 10:12', user: 'Janar Kuusk', action: 'Invite User', details: 'Invited sarah@example.com as manager' },
  { id: '2', date: '2024-06-20 10:15', user: 'Janar Kuusk', action: 'Change Plan', details: 'Upgraded to Pro' },
  { id: '3', date: '2024-06-20 10:20', user: 'Sarah Johnson', action: 'Add Custom Field', details: 'Added "Source" to Deals' }
];

const AuditLogs: React.FC = () => {
  const [logs] = useState(initialLogs);
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log =>
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <List className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-semibold text-white">Audit Logs</h3>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-secondary-400" />
        <input
          type="text"
          placeholder="Search logs by user, action, or details"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded-md bg-secondary-800 text-white border border-secondary-600 focus:outline-none"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-secondary-400">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} className="border-b border-secondary-700">
                <td className="p-2">{log.date}</td>
                <td className="p-2">{log.user}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AuditLogs; 