'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Plus } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';
import DataTable, { Column } from '@/components/Table/DataTable';
import FilterDropdown from '@/components/Filters/FilterDropdown';
import Modal from '@/components/Modal/Modal';

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
  data: { users: AdminUser[]; total: number; page: number; limit: number };
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

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}
function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
        style={{ backgroundColor: checked ? '#1E3A8A' : '#D1D5DB' }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

interface EditModalProps {
  user: AdminUser;
  onClose: () => void;
}
function EditUserModal({ user, onClose }: EditModalProps) {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [roles, setRoles] = useState({
    shipper:     user.role === 'SHIPPER',
    transporter: user.role === 'TRANSPORTER',
    admin:       user.role === 'ADMIN',
  });
  const [perms, setPerms] = useState({
    viewLoads:   true,
    postLoads:   user.role === 'SHIPPER',
    manageUsers: user.role === 'ADMIN',
    analytics:   user.role === 'ADMIN',
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const role: AdminUser['role'] =
        roles.admin ? 'ADMIN' : roles.transporter ? 'TRANSPORTER' : 'SHIPPER';
      return api.patch(`/admin/users/${user.id}`, { role });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      addToast('success', 'User updated successfully');
      onClose();
    },
    onError: () => addToast('error', 'Failed to update user'),
  });

  return (
    <div className="space-y-5">
      {/* User summary */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${avatarBg(user.role)}`}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email ?? user.phone}</p>
        </div>
        <span className={cn('ml-auto text-xs font-medium px-2 py-0.5 rounded-full', user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Roles */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role</p>
        <div className="rounded-lg border border-gray-100 px-3">
          <ToggleRow label="Shipper"     checked={roles.shipper}     onChange={(v) => setRoles((r) => ({ ...r, shipper: v }))} />
          <ToggleRow label="Transporter" checked={roles.transporter} onChange={(v) => setRoles((r) => ({ ...r, transporter: v }))} />
          <ToggleRow label="Admin"       checked={roles.admin}       onChange={(v) => setRoles((r) => ({ ...r, admin: v }))} />
        </div>
      </div>

      {/* Permissions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permissions</p>
        <div className="rounded-lg border border-gray-100 px-3">
          <ToggleRow label="View Loads"   checked={perms.viewLoads}   onChange={(v) => setPerms((p) => ({ ...p, viewLoads: v }))} />
          <ToggleRow label="Post Loads"   checked={perms.postLoads}   onChange={(v) => setPerms((p) => ({ ...p, postLoads: v }))} />
          <ToggleRow label="Manage Users" checked={perms.manageUsers} onChange={(v) => setPerms((p) => ({ ...p, manageUsers: v }))} />
          <ToggleRow label="Analytics"    checked={perms.analytics}   onChange={(v) => setPerms((p) => ({ ...p, analytics: v }))} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="flex-1 h-9 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e3a8a]/90 transition-colors disabled:opacity-60"
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

const ROLE_OPTIONS = [
  { label: 'All Roles',   value: 'ALL' },
  { label: 'Shipper',     value: 'SHIPPER' },
  { label: 'Transporter', value: 'TRANSPORTER' },
  { label: 'Admin',       value: 'ADMIN' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Active',       value: 'ACTIVE' },
  { label: 'Inactive',     value: 'INACTIVE' },
];

export default function AdminUsersPage() {
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editUser,     setEditUser]     = useState<AdminUser | null>(null);

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  });

  const users = (data?.data?.users ?? []).filter((u) => {
    const matchRole   = roleFilter   === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL'
      || (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive);
    const matchSearch = !search
      || u.name.toLowerCase().includes(search.toLowerCase())
      || u.phone.includes(search)
      || (u.email ?? '').toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (_, u) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarBg(u.role)}`}>
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{u.name}</p>
            <p className="text-xs text-gray-400">{u.email ?? u.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (_, u) => (
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', roleBadge(u.role))}>
          {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (_, u) => <span className="text-sm text-gray-600">{u.company ?? '—'}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (_, u) => (
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (_, u) => (
        <span className="text-xs text-gray-500">
          {u.updatedAt ? formatDate(u.updatedAt) : formatDate(u.createdAt)}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, u) => (
        <button
          onClick={(e) => { e.stopPropagation(); setEditUser(u); }}
          className="text-xs font-medium text-[#1E3A8A] hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage platform users — shippers, transporters, and admins.
          </p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-green-700 transition-colors shrink-0">
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="ff-input pl-8 text-xs h-8"
          />
        </div>
        <FilterDropdown
          label="All Roles"
          options={ROLE_OPTIONS}
          selected={roleFilter}
          onChange={setRoleFilter}
        />
        <FilterDropdown
          label="All Statuses"
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onChange={setStatusFilter}
        />
        <p className="text-xs text-gray-400 ml-auto">
          {users.length} of {data?.data?.total ?? 0} users
        </p>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {users.length === 0 && !isLoading ? (
          <div className="py-16 text-center">
            <Users className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-500">No users found</p>
          </div>
        ) : (
          <DataTable<AdminUser>
            columns={columns}
            data={users}
            keyField="id"
            loading={isLoading}
            onRowClick={(u) => setEditUser(u)}
          />
        )}
      </div>

      {/* Edit user modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
        size="sm"
      >
        {editUser && (
          <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
        )}
      </Modal>
    </div>
  );
}
