import { cn, formatDate } from '@/lib/utils';
import DataTable, { Column } from '@/components/Table/DataTable';
import type { AdminUser } from '@/types';

function avatarBg(role: string) {
  if (role === 'SHIPPER')     return 'bg-blue-600';
  if (role === 'TRANSPORTER') return 'bg-purple-600';
  return 'bg-[#1E3A8A]';
}

function roleBadge(role: string) {
  if (role === 'SHIPPER')     return 'bg-blue-50 text-blue-700 border-blue-200';
  if (role === 'TRANSPORTER') return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

interface UserTableProps {
  users: AdminUser[];
  loading?: boolean;
  onEdit?: (user: AdminUser) => void;
  onToggleActive?: (user: AdminUser) => void;
  onDelete?: (user: AdminUser) => void;
}

export default function UserTable({
  users,
  loading = false,
  onEdit,
  onToggleActive,
  onDelete,
}: UserTableProps) {
  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'User',
      render: (v, row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarBg(row.role)}`}>
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{String(v)}</p>
            <p className="text-xs text-gray-400 truncate">{row.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (v) => (
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', roleBadge(String(v)))}>
          {String(v)}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (v) => (
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', v ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
          {v ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (v) => <span className="text-xs text-gray-500">{formatDate(String(v))}</span>,
    },
    ...(onEdit || onToggleActive || onDelete
      ? [{
          key: 'id' as keyof AdminUser,
          header: 'Actions',
          render: (_: unknown, row: AdminUser) => (
            <div className="flex items-center gap-1.5">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                  className="text-xs px-2.5 h-7 rounded-lg bg-[#1E3A8A] text-white font-medium hover:bg-blue-900 transition-colors"
                >
                  Edit
                </button>
              )}
              {onToggleActive && row.role !== 'ADMIN' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleActive(row); }}
                  className={cn('h-7 w-7 rounded-lg flex items-center justify-center transition-colors', row.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100')}
                  title={row.isActive ? 'Suspend' : 'Activate'}
                >
                  {row.isActive ? '⏸' : '▶'}
                </button>
              )}
              {onDelete && row.role !== 'ADMIN' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                  className="h-7 w-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  ✕
                </button>
              )}
            </div>
          ),
        }]
      : []),
  ];

  return (
    <DataTable<AdminUser>
      columns={columns}
      data={users}
      keyField="id"
      loading={loading}
      emptyMessage="No users found"
    />
  );
}
