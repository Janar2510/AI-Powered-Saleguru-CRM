import React, { useState } from 'react';
import { Zap, ToggleRight, ToggleLeft } from 'lucide-react';
import Card from '../ui/Card';
import Toggle from '../ui/Toggle';

const modules = [
  { id: 'social', label: 'Social Mentions' },
  { id: 'gamification', label: 'Gamification' },
  { id: 'calls', label: 'Calls' },
  { id: 'lead_scoring', label: 'Lead Scoring' },
  { id: 'marketplace', label: 'Marketplace' }
];

const roles = ['admin', 'manager', 'sales_rep'];

const initialToggles: Record<string, Record<string, boolean>> = {
  social: { admin: true, manager: true, sales_rep: true },
  gamification: { admin: true, manager: true, sales_rep: false },
  calls: { admin: true, manager: true, sales_rep: true },
  lead_scoring: { admin: true, manager: true, sales_rep: false },
  marketplace: { admin: true, manager: false, sales_rep: false }
};

const FeatureToggles: React.FC = () => {
  const [toggles, setToggles] = useState<Record<string, Record<string, boolean>>>(initialToggles);

  const handleToggle = (moduleId: string, role: string) => {
    setToggles(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [role]: !prev[moduleId][role]
      }
    }));
    // Log: Feature toggled
  };

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-semibold text-white">Feature Toggles</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-secondary-400">
              <th className="p-2 text-left">Module</th>
              {roles.map(role => (
                <th key={role} className="p-2 text-center capitalize">{role.replace('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(module => (
              <tr key={module.id} className="border-b border-secondary-700">
                <td className="p-2 font-medium text-primary-100">{module.label}</td>
                {roles.map(role => (
                  <td key={role} className="p-2 text-center">
                    <Toggle
                      checked={toggles[module.id][role]}
                      onChange={() => handleToggle(module.id, role)}
                      variant="gradient"
                      aria-label={`Toggle ${module.label} for ${role}`}
                      className=""
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default FeatureToggles; 