'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Plus, Pencil, Filter, X } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'SHIPPER' | 'TRANSPORTER' | 'ADMIN';
  company?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface UsersResponse {
  data: AdminUser[];
}

function roleBadge(r: string) {
  if (r === 'SHIPPER')     return 'bg-blue-50 text-blue-700 border-blue-200';
  if (r === 'TRANSPORTER') return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function avatarBg(r: string) {
  if (r === 'SHIPPER')     return 'bg-blue-600';
  if (r === 'TRANSPORTER') return 'bg-purple-600';
  return 'bg-[#1E3A8A]';
}

interface ToggleProps { label: string; checked: boolean; onChange: (v: boolean) => void; color?: string; }
function Toggle({ label, checked, onChange, color = '#1E3A8A' }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none"
        style={{ backgroundColor: checked ? color : '#D1D5DB' }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

interface UserDetailPanelProps {
  user: AdminUser;
  onClose: () => void;
}

function UserDetailPanel({ user, onClose }: UserDetailPanelProps) {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [roles, setRoles] = useState({
    shipper:     user.role === 'SHIPPER',
    transporter: user.role === 'TRANSPORTER',
    admin:       user.role === 'ADMIN',
  });
  const [perms, setPerms] = useState({
    viewLoads:    true,
    postLoads:    user.role === 'SHIPPER',
    manageUsers:  user.role === 'ADMIN',
    analytics:    user.role === 'ADMIN',
  });

  const saveMut = useMutation({
    mutationFn: () => api.patch(`/admin/users/${user.id}`, { roles, permissions: perms }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      addToast('success', 'User updated successfully');
    },
    onError: () => addToast('error', 'Failed to update user'),
  });

  return (
    <div className="w-72 shrink-0 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">User Details</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* User card */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${avatarBg(user.role)}`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email ?? user.phone}</p>
            </div>
          </div>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Roles */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Roles</p>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 px-3">
            <Toggle label="Shipper"     checked={roles.shipper}     onChange={(v) => setRoles((r) => ({ ...r, shipper: v }))} />
            <Toggle label="Transporter" checked={roles.transporter} onChange={(v) => setRoles((r) => ({ ...r, transporter: v }))} />
            <Toggle label="Admin"       checked={roles.admin}       onChange={(v) => setRoles((r) => ({ ...r, admin: v }))} />
          </div>
        </div>

        {/* Permissions */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permissions</p>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 px-3">
            <Toggle label="View Loads"    checked={perms.viewLoads}   onChange={(v) => setPerms((p) => ({ ...p, viewLoads: v }))} />
            <Toggle label="Post Loads"    checked={perms.postLoads}   onChange={(v) => setPerms((p) => ({ ...p, postLoads: v }))} />
            <Toggle label="Manage Users"  checked={perms.manageUsers} onChange={(v) => setPerms((p) => ({ ...p, manageUsers: v }))} />
            <Toggle label="Analytics"     checked={perms.analytics}   onChange={(v) => setPerms((p) => ({ ...p, analytics: v }))} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="flex-1 h-9 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e3a8a]/90 transition-colors"
        >
          {saveMut.isPending ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onClose}
          className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All Roles');
  const [status, setStatus] = useState('All Statuses');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  });

  const users = (data?.data ?? []).filter((u) => {
    const matchRole   = role === 'All Roles'    || u.role === role;
    const matchStatus = status === 'All Statuses' || (status === 'Active' ? u.isActive : !u.isActive);
    const matchSearch = !search
      || u.name.toLowerCase().includes(search.toLowerCase())
      || u.phone.includes(search)
      || (u.email ?? '').toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  return (
    <div className="flex h-full gap-0">
      <div className="flex-1 min-w-0 space-y-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage platform users including shippers and transporters, their roles and permissions.</p>
          </div>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-green-700 transition-colors shrink-0">
            <Plus size={15} /> Add User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for name, detail, or others..."
              className="ff-input pl-8 text-xs h-8"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="ff-input h-8 text-xs w-auto pr-7"
          >
            <option>All Roles</option>
            <option value="SHIPPER">Shipper</option>
            <option value="TRANSPORTER">Transporter</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="ff-input h-8 text-xs w-auto pr-7"
          >
            <option>All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={12} /> Filters
          </button>
          <p className="text-xs text-gray-400 ml-auto">{users.length} users</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-100 rounded-full" />
                  <div className="h-3 bg-gray-100 rounded flex-1" />
                  <div className="h-5 bg-gray-100 rounded w-24" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="text-sm font-medium text-gray-500">No users found</p>
            </div>
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={cn('cursor-pointer', selectedUser?.id === u.id && 'bg-blue-50/50')}
                    onClick={() => setSelectedUser(u.id === selectedUser?.id ? null : u)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarBg(u.role)}`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email ?? u.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', roleBadge(u.role))}>
                        {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{u.company ?? '—'}</td>
                    <td>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500">{u.updatedAt ? formatDate(u.updatedAt) : formatDate(u.createdAt)}</td>
                    <td>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination hint */}
        {users.length > 0 && (
          <p className="text-xs text-gray-400 px-1">Showing 1 to {Math.min(users.length, 10)} of {users.length} users</p>
        )}
      </div>

      {/* Right panel */}
      {selectedUser && (
        <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
