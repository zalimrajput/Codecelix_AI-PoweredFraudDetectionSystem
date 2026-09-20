/**
 * CodeCelix API Client Configuration
 * 
 * Central HTTP client interface. Configured for backend integration.
 * Teammate instructions:
 * 1. Set VITE_API_BASE_URL in .env (defaults to '/api')
 * 2. Connect authorization header with your token storage mechanism
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = localStorage.getItem('codecelix_auth_token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      if (response.status === 401) {
        try {
          localStorage.removeItem('codecelix_auth_token');
          localStorage.removeItem('codecelix_user_role');
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        } catch {
          // Ignore browser storage error
        }
      }
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.detail || errorBody.message || errorMessage;
      } catch {
        // Response was not JSON
      }
      throw new ApiError(errorMessage, response.status);
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network communication failed. Connect backend API to resolve.',
      0
    );
  }
}
