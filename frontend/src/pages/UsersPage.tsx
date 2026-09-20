import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { UserFilters } from '../features/users/UserFilters';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { getUsers, createUser, updateUserStatus } from '../api/users';
import { UserAccount, UserFilter, UserStatus, CreateUserPayload } from '../types/user';
import { UserRole } from '../types/auth';
import { Users, UserPlus, RefreshCw, UserCheck, Shield, Mail } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const UsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilter>({});
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState<CreateUserPayload>({
    fullName: '',
    email: '',
    role: 'ANALYST',
    department: '',
  });

  const fetchUsersList = async (currentFilters: UserFilter = filters) => {
    setIsLoading(true);
    try {
      const data = await getUsers(currentFilters);
      setUsers(data || []);
    } catch {
      // Backend not connected yet: empty list
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList(filters);
  }, []);

  const handleFilterChange = (newFilters: UserFilter) => {
    setFilters(newFilters);
    fetchUsersList(newFilters);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createUser(inviteData);
      setUsers((prev) => [created, ...prev]);
      showToast('success', 'Analyst Invited', `Invitation sent to ${inviteData.email}`);
      setIsInviteModalOpen(false);
    } catch {
      showToast('info', 'Integration Notice', 'Endpoint POST /api/users is pending backend integration.');
      setIsInviteModalOpen(false);
    }
  };

  const handleStatusToggle = async (user: UserAccount) => {
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateUserStatus(user.id, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      showToast('success', 'User Status Updated', `Account is now ${newStatus.toLowerCase()}.`);
    } catch {
      showToast('info', 'Integration Notice', `Endpoint PATCH /api/users/${user.id}/status is pending integration.`);
    }
  };

  const statusVariantMap: Record<UserStatus, 'low' | 'medium' | 'high' | 'neutral'> = {
    ACTIVE: 'low',
    SUSPENDED: 'high',
    PENDING_INVITE: 'medium',
    INACTIVE: 'neutral',
  };

  const columns: Column<UserAccount>[] = [
    {
      key: 'fullName',
      header: 'Analyst / Member',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs">
            {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <span className="font-sans font-semibold text-slate-200 block text-xs">{u.fullName}</span>
            <span className="font-mono text-[10px] text-slate-500">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (u) => (
        <Badge variant={u.role === 'ADMIN' ? 'purple' : u.role === 'BUSINESS_MANAGER' ? 'blue' : 'neutral'} size="sm">
          {u.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (u) => (
        <Badge variant={statusVariantMap[u.status]} size="sm">
          {u.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (u) => (
        <span className="font-sans text-xs text-slate-300">
          {u.department || 'Fraud Operations'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Provisioned Date',
      render: (u) => <span className="font-mono text-[11px] text-slate-400">{u.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStatusToggle(u)}
        >
          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workstation Access & Identity Management"
        description="Administrative role assignment and analyst credential governance"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users & Access' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsersList()}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Directory
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Provision Analyst
            </Button>
          </>
        }
      />

      {/* Filter Bar */}
      <UserFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => {
          setFilters({});
          fetchUsersList({});
        }}
      />

      {/* Dynamic Data Table */}
      <DataTable<UserAccount>
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyIcon={Users}
        emptyTitle="No team members available"
        emptyDescription="Directory will populate when active analyst accounts are provisioned via backend."
        emptyActionLabel="Provision Analyst"
        onEmptyAction={() => setIsInviteModalOpen(true)}
        rowKey={(u) => u.id}
      />

      {/* Provision Analyst Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Provision Platform User"
        description="Grant fraud detection intelligence workspace access to a security analyst"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleInviteSubmit}>
              Send Access Invitation
            </Button>
          </>
        }
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Agent Jane Doe"
            value={inviteData.fullName}
            onChange={(e) => setInviteData({ ...inviteData, fullName: e.target.value })}
            required
          />

          <Input
            label="Corporate Email"
            type="email"
            placeholder="jdoe@enterprise.com"
            value={inviteData.email}
            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
            required
          />

          <Select
            label="Role Scope"
            value={inviteData.role}
            onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as UserRole })}
            options={[
              { value: 'ANALYST', label: 'Fraud Analyst' },
              { value: 'BUSINESS_MANAGER', label: 'Business Risk Manager' },
              { value: 'ADMIN', label: 'System Administrator' },
            ]}
          />

          <Input
            label="Department / Unit"
            placeholder="e.g. Threat Intelligence Group"
            value={inviteData.department || ''}
            onChange={(e) => setInviteData({ ...inviteData, department: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
