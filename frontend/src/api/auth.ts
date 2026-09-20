/**
 * CodeCelix Authentication Service
 * 
 * Integrated with FastAPI backend authentication:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - GET  /api/auth/me
 */

import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterPayload, UserProfile, UserRole } from '../types/auth';

interface BackendUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
  last_login_at?: string;
}

interface BackendTokenResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}

function normalizeRole(role: string): UserRole {
  const r = (role || 'ANALYST').toUpperCase();
  if (r === 'BUSINESS_MANAGER' || r === 'MANAGER') return 'BUSINESS_MANAGER';
  if (r === 'ADMIN') return 'ADMIN';
  return 'ANALYST';
}

function formatUserProfile(u: BackendUser): UserProfile {
  return {
    id: u.id,
    email: u.email,
    fullName: u.full_name || u.email.split('@')[0],
    role: normalizeRole(u.role),
    lastLogin: u.last_login_at || u.created_at,
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await apiClient<BackendTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  return {
    token: res.access_token,
    user: formatUserProfile(res.user),
  };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const roleLower = (payload.role || 'ANALYST').toLowerCase();
  await apiClient<BackendUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      full_name: payload.fullName,
      role: roleLower,
    }),
  });

  // Automatically login on registration to issue JWT
  return login({
    email: payload.email,
    password: payload.password,
  });
}

export async function getCurrentUser(): Promise<UserProfile> {
  const u = await apiClient<BackendUser>('/auth/me', {
    method: 'GET',
  });
  return formatUserProfile(u);
}

export async function logout(): Promise<void> {
  try {
    localStorage.removeItem('codecelix_auth_token');
    localStorage.removeItem('codecelix_user_role');
  } catch {
    // Ignore storage clear errors
  }
}
