import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User, Loader, RefreshCw, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { supabase } from '../../services/supabase';
import { useToastContext } from '../../contexts/ToastContext';
import { Modal } from '../ui/Modal';

// Define Role type
const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales_rep', label: 'Sales Rep' }
] as const;
type RoleValue = typeof roles[number]['value'];

function generateRandomPassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const ssoProviders = [
  { id: 'google', label: 'Google', enabled: true },
  { id: 'microsoft', label: 'Microsoft', enabled: false },
  { id: 'saml', label: 'SAML', enabled: false }
];
const permissions = [
  { id: 'view_deals', label: 'View Deals' },
  { id: 'edit_deals', label: 'Edit Deals' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'api_access', label: 'API Access' }
];
const roleMatrix: Record<RoleValue, string[]> = {
  admin: ['view_deals', 'edit_deals', 'manage_users', 'view_reports', 'api_access'],
  manager: ['view_deals', 'edit_deals', 'view_reports'],
  sales_rep: ['view_deals']
};
const mockActivity = [
  { time: '2024-07-20 10:00', action: 'Logged in (Google SSO)' },
  { time: '2024-07-20 09:45', action: 'Viewed Deals' },
  { time: '2024-07-19 18:00', action: 'Updated Profile' }
];
const mockApiKeys = [
  { key: 'sk-1234-5678', created: '2024-07-18', lastUsed: '2024-07-20', status: 'active' }
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('sales_rep');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showActivity, setShowActivity] = useState<{ user: any, open: boolean }>({ user: null, open: false });
  const [showPermissions, setShowPermissions] = useState(false);
  const { showToast } = useToastContext();

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.from('user_profiles').select('*');
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      showToast({ title: 'Error fetching users', description: error.message, type: 'error' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Invite user logic
  const handleInvite = async () => {
    setLoading(true);
    setShowPassword(false);
    setGeneratedPassword('');
    try {
      // 1. Generate random password
      const password = generateRandomPassword();
      // 2. Create user in Supabase Auth (admin API)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: inviteEmail,
        password,
        email_confirm: true
      });
      if (authError) throw authError;
      // 3. Insert into user_profiles table
      const { error: dbError } = await supabase.from('user_profiles').insert({
        id: authUser.user.id,
        email: inviteEmail,
        role: inviteRole,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_name: '',
        last_name: ''
      });
      if (dbError) throw dbError;
      // 4. Show password to admin
      setGeneratedPassword(password);
      setShowPassword(true);
      setInviteEmail('');
      setInviteRole('sales_rep');
      showToast({ title: 'User invited', description: 'User has been invited. Share the password securely.', type: 'success' });
      fetchUsers();
    } catch (error: any) {
      showToast({ title: 'Invite failed', description: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Change user role
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const { error } = await supabase.from('user_profiles').update({ role: newRole, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      showToast({ title: 'Role updated', type: 'success' });
      fetchUsers();
    } catch (error: any) {
      showToast({ title: 'Role update failed', description: error.message, type: 'error' });
    }
  };

  // Remove user
  const handleRemove = async (id: string) => {
    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);
      if (error) throw error;
      showToast({ title: 'User removed', type: 'success' });
      fetchUsers();
    } catch (error: any) {
      showToast({ title: 'Remove failed', description: error.message, type: 'error' });
    }
  };

  return (
    <Card>
      {/* SSO Providers */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-2">SSO Providers</h4>
        <div className="flex gap-4">
          {ssoProviders.map(provider => (
            <div key={provider.id} className="flex items-center gap-2">
              <span className="text-white font-medium">{provider.label}</span>
              <Button variant={provider.enabled ? 'gradient' : 'secondary'} size="sm">{provider.enabled ? 'Enabled' : 'Enable'}</Button>
            </div>
          ))}
        </div>
      </div>
      {/* Invite User Form */}
      <div className="mb-6 flex gap-2">
        <input
          type="email"
          placeholder="Invite user by email"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          className="px-3 py-2 rounded-md bg-secondary-800 text-white border border-secondary-600 focus:outline-none"
        />
        <select
          value={inviteRole}
          onChange={e => setInviteRole(e.target.value)}
          className="px-3 py-2 rounded-md bg-secondary-800 text-white border border-secondary-600 focus:outline-none"
        >
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <Button
          onClick={handleInvite}
          disabled={!inviteEmail || loading}
          variant="gradient"
          size="md"
          icon={UserPlus}
          loading={loading}
          className="min-w-[120px]"
        >
          Invite
        </Button>
      </div>
      {showPassword && (
        <div className="mb-4 p-3 bg-secondary-800 rounded-md text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary-400" />
          <span className="font-mono">Password: <b>{generatedPassword}</b></span>
          <span className="text-xs text-secondary-400 ml-2">Share this password securely with the user.</span>
        </div>
      )}
      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-secondary-400">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">SSO</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-secondary-700">
                <td className="p-2">{user.first_name || user.name || <span className="italic text-secondary-500">(Pending)</span>}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    className="bg-secondary-800 text-white rounded-md px-2 py-1"
                  >
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  {user.must_change_password && <Badge variant="warning" size="sm">Must Change Password</Badge>}
                  {user.onboarding_completed && <Badge variant="success" size="sm">Active</Badge>}
                  {!user.onboarding_completed && !user.must_change_password && <Badge variant="secondary" size="sm">Invited</Badge>}
                </td>
                <td className="p-2">
                  {/* Mock SSO status: alternate Google SSO/Password */}
                  {user.id % 2 === 0 ? <Badge variant="primary" size="sm">Google SSO</Badge> : <Badge variant="secondary" size="sm">Password</Badge>}
                </td>
                <td className="p-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowActivity({ user, open: true })}>Activity Log</Button>
                  <button
                    onClick={() => handleRemove(user.id)}
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
      {/* Roles & Permissions Matrix */}
      <div className="mt-6">
        <Button variant="gradient" size="md" onClick={() => setShowPermissions(v => !v)}>
          {showPermissions ? 'Hide Roles & Permissions' : 'Show Roles & Permissions'}
        </Button>
        {showPermissions && (
          <div className="mt-4 bg-[#23233a]/40 border border-[#23233a]/30 rounded p-4">
            <h4 className="text-lg font-semibold text-white mb-2">Roles & Permissions</h4>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-secondary-400">
                  <th className="p-2 text-left">Permission</th>
                  {roles.map(role => (
                    <th key={role.value} className="p-2 text-center">{role.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map(perm => (
                  <tr key={perm.id} className="border-b border-secondary-700">
                    <td className="p-2 text-white">{perm.label}</td>
                    {roles.map(role => (
                      <td key={role.value} className="p-2 text-center">
                        <input type="checkbox" checked={roleMatrix[role.value].includes(perm.id)} readOnly className="accent-primary-600" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Activity Log Modal */}
      {showActivity.open && (
        <Modal open={showActivity.open} onClose={() => setShowActivity({ user: null, open: false })}>
          <div className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Activity Log for {showActivity.user.first_name || showActivity.user.name}</h4>
            <ul className="space-y-2">
              {mockActivity.map((entry, idx) => (
                <li key={idx} className="text-sm text-secondary-300">
                  <span className="font-mono text-primary-400">{entry.time}</span> — {entry.action}
                </li>
              ))}
            </ul>
            <div className="mt-6 text-right">
              <Button variant="secondary" size="md" onClick={() => setShowActivity({ user: null, open: false })}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
      {/* API Key Management (for admin/dev) */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-white mb-2">API Key Management</h4>
        <div className="bg-[#23233a]/40 border border-[#23233a]/30 rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary-300">API Key</span>
            <Button variant="gradient" size="sm">Generate New Key</Button>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-secondary-400">
                <th className="p-2 text-left">Key</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Last Used</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockApiKeys.map((key, idx) => (
                <tr key={idx} className="border-b border-secondary-700">
                  <td className="p-2 font-mono text-primary-400">{key.key}</td>
                  <td className="p-2">{key.created}</td>
                  <td className="p-2">{key.lastUsed}</td>
                  <td className="p-2">
                    <Badge variant="success" size="sm">{key.status}</Badge>
                  </td>
                  <td className="p-2">
                    <Button variant="secondary" size="sm">Revoke</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default UserManagement; 