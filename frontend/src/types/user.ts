import { UserRole } from './auth';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_INVITE' | 'INACTIVE';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  lastLogin?: string;
  createdAt: string;
  casesInvestigatedCount?: number;
}

export interface UserFilter {
  search?: string;
  role?: UserRole | 'ALL';
  status?: UserStatus | 'ALL';
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
}
