const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  token?: string;
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

// ------------------------------------------
// Auth API helpers
// ------------------------------------------

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  session: {
    access_token: string;
    refresh_token: string;
  };
  user: UserProfile;
  redirectPath: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  role: string;
  educationLevel: string | null;
  contactNumber: string;
  sex: string;
  birthdate: string;
  school: string | null;
  gradeLevel: number | null;
  occupation: string | null;
  department?: string | null;
  schoolId?: number | null;
  lrn?: number | null;
  employeeId?: number | null;
  track?: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  city: string;
  barangay: string;
  street: string;
  sex: string;
  birthdate: string;
  isWMSU: boolean;
  isFaculty: boolean;
  department: string;
  occupation: string;
  educationLevel: string;
  school: string;
  course: string;
  gradeLevel: string;
  track: string;
  schoolId: number | null;
  lrn: number | null;
  employeeId: number | null;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api<LoginResponse>('/api/auth/login', { method: 'POST', body: payload as unknown as Record<string, unknown> }),

  register: (payload: RegisterPayload) =>
    api<RegisterResponse>('/api/auth/register', { method: 'POST', body: payload as unknown as Record<string, unknown> }),

  getProfile: (token: string) =>
    api<{ user: UserProfile; redirectPath: string }>('/api/auth/profile', { token }),
};

export const cmsApi = {
  getContent: (section: string) =>
    api<any>(`/api/cms/${section}`),

  getAcademicData: () =>
    api<any>('/api/cms/academic-data'),

  updateContent: (section: string, content: any, token?: string) =>
    api<any>(`/api/cms/${section}`, { method: 'PUT', body: content, token }),
};
