import { apiClient } from './client';
import { UserAccount, UserFilter, CreateUserPayload, UserStatus } from '../types/user';
import { UserRole } from '../types/auth';

function mapBackendRole(role?: string): UserRole {
  const normalized = (role || '').toUpperCase();
  if (normalized.includes('ADMIN')) return 'ADMIN';
  if (normalized.includes('BUSINESS')) return 'BUSINESS_MANAGER';
  return 'ANALYST';
}

function mapBackendUser(u: any): UserAccount {
  return {
    id: String(u.id),
    fullName: u.full_name || u.fullName || u.email?.split('@')[0] || 'User',
    email: u.email,
    role: mapBackendRole(u.role),
    status: (u.is_active !== false) ? 'ACTIVE' : 'INACTIVE',
    department: u.department || 'Fraud Risk Team',
    createdAt: u.created_at || new Date().toISOString(),
    casesInvestigatedCount: u.cases_investigated_count || 0,
  };
}

export async function getUsers(filter?: UserFilter): Promise<UserAccount[]> {
  const users = await apiClient<any[]>('/auth/users', { method: 'GET' });
  const mapped = (users || []).map(mapBackendUser);
  if (!filter) return mapped;
  return mapped.filter(u => {
    if (filter.role && filter.role !== 'ALL' && u.role !== filter.role) return false;
    if (filter.status && filter.status !== 'ALL' && u.status !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });
}

export async function createUser(payload: CreateUserPayload): Promise<UserAccount> {
  const created = await apiClient<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      full_name: payload.fullName,
      role: payload.role.toLowerCase(),
      password: 'ChangeMe123!',
    }),
  });
  return mapBackendUser(created);
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<UserAccount> {
  const updated = await apiClient<any>(`/auth/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: status === 'ACTIVE' }),
  });
  return mapBackendUser(updated);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient<void>(`/auth/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: false }),
  });
}
