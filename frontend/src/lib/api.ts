const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();

// When running on localhost / 127.0.0.1, connect to local backend (port 5002)
// In production builds or when hosted, use VITE_API_URL
export const API_URL = isLocal && import.meta.env.VITE_REMOTE_DEV !== 'true'
  ? (envApiUrl.includes('localhost') || envApiUrl.includes('127.0.0.1') ? envApiUrl : 'http://localhost:5002')
  : (envApiUrl || (isLocal ? 'http://localhost:5002' : ''));

if (typeof window !== 'undefined' && import.meta.env.PROD && !envApiUrl) {
  console.error('VITE_API_URL is required for production builds.');
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  token?: string;
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
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

  try {
    const base = API_URL || (isLocal ? 'http://localhost:5002' : '');
    if (!base) {
      return {
        ok: false,
        status: 500,
        data: null as unknown as T,
        error: 'API is not configured. Set VITE_API_URL.',
      };
    }

    // Ensure no trailing slash on base, and ensure endpoint starts with a single slash to prevent double-slash errors
    const sanitizedBase = base.replace(/\/+$/, '');
    const sanitizedEndpoint = '/' + endpoint.replace(/^\/+/, '');
    const requestUrl = `${sanitizedBase}${sanitizedEndpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(requestUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: unknown = null;

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        const text = await response.text();
        let cleanText = text;
        const preMatch = text.match(/<pre>(.*?)<\/pre>/is);
        if (preMatch && preMatch[1]) {
          cleanText = preMatch[1].replace(/<[^>]*>/g, '').trim();
        } else if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          cleanText = `Request failed with status ${response.status} (${response.statusText || 'Server error'})`;
        }
        data = cleanText ? { error: cleanText.slice(0, 500) } : null;
      }

      const errMsg =
        data && typeof data === 'object' && data !== null && 'error' in data
          ? String((data as { error?: unknown }).error)
          : undefined;

      return {
        ok: response.ok,
        status: response.status,
        data: data as T,
        error: !response.ok ? errMsg || 'Request failed.' : undefined,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err: any) {
    console.error(`API Error (${endpoint}):`, err);
    const isTimeout = err?.name === 'AbortError';
    return {
      ok: false,
      status: isTimeout ? 408 : 500,
      data: null as unknown as T,
      error: isTimeout
        ? 'Request timed out. Please try again.'
        : 'Unable to connect to the server. Please check your internet connection or try again later.',
    };
  }
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
  courseId?: string | null;
  courseName?: string | null;
  collegeName?: string | null;
  schoolId?: number | null;
  lrn?: number | null;
  employeeId?: number | null;
  track?: string | null;
  city?: string | null;
  barangay?: string | null;
  street?: string | null;
  address_city?: string | null;
  address_barangay?: string | null;
  address_street?: string | null;
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
  userId?: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api<LoginResponse>('/api/auth/login', { method: 'POST', body: payload as unknown as Record<string, unknown> }),

  register: (payload: RegisterPayload) =>
    api<RegisterResponse>('/api/auth/register', { method: 'POST', body: payload as unknown as Record<string, unknown> }),

  checkEmail: (email: string) =>
    api<{ exists: boolean; message?: string }>('/api/auth/check-email', { method: 'POST', body: { email } }),

  getProfile: (token: string) =>
    api<{ user: UserProfile; redirectPath: string }>('/api/auth/profile', { token }),

  forgotPassword: (email: string) =>
    api<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (password: string, token: string) =>
    api<{ message: string }>('/api/auth/reset-password', { method: 'POST', body: { password }, token }),

  updateProfile: (payload: Partial<UserProfile>, token: string) =>
    api<{ message: string; user: UserProfile }>('/api/auth/profile', { method: 'PUT', body: payload as unknown as Record<string, unknown>, token }),
};

export const cmsApi = {
  getContent: (section: string) =>
    api<any>(`/api/cms/${section}`),

  getAcademicData: () =>
    api<any>('/api/cms/academic-data'),

  updateContent: (section: string, content: any, token?: string) =>
    api<any>(`/api/cms/${section}`, { method: 'PUT', body: content, token }),
};

export interface CounselingAvailabilityResponse {
  occupied: string[];
}

export interface AssessmentAvailabilityResponse {
  occupied: string[];
}

export interface CreateCounselingAppointmentPayload {
  date: string;
  timeSlot: string;
}

export interface CreateAssessmentAppointmentPayload {
  date: string;
  timeSlot: string;
}

export interface CreateCounselingAppointmentResponse {
  message: string;
  appointment: {
    id: string;
    scheduled_time: string;
    created_at: string;
  };
}

export interface CreateAssessmentAppointmentResponse {
  message: string;
  appointment: {
    id: string;
    scheduled_time: string;
    created_at: string;
  };
  assessmentType: 'Assessment (DAS-Y)' | 'Assessment (DAS-21)';
}

export interface CreateShiftingAppointmentPayload {
  currentCourse: string;
  targetCourse: string;
  reason: string;
  pictureName: string;
  gradesName: string;
  latestCorName: string;
  entranceResultName: string;
}

export interface CreateShiftingAppointmentResponse {
  message: string;
  appointment: {
    id: string;
    scheduled_time: string;
    created_at: string;
  };
}

export interface LatestShiftingAppointmentResponse {
  appointment: {
    id: string;
    scheduled_time: string;
    created_at: string;
    currentCourse?: string;
    targetCourse?: string;
    appointment_statuses?: {
      status_name: string;
    } | null;
  } | null;
}

export interface LatestAppointmentResponse {
  appointment: {
    id: string;
    scheduled_time: string;
    created_at: string;
    appointment_statuses: {
      status_name: string;
    } | null;
  } | null;
}

export interface ShiftingSubmissionStatusResponse {
  isOpen: boolean;
  status: string;
  startDate?: string;
  endDate?: string;
  examDate?: string;
}

export interface ShiftingConfigResponse {
  status: string;
  startDate: string;
  endDate: string;
  examDate: string;
  examTime: string;
}

export interface UpdateShiftingConfigPayload {
  startDate: string;
  endDate: string;
  examDate: string;
  examTime: string;
}

export interface HistoryItem {
  id: string;
  student: string;
  level: string;
  type: string;
  date: string;
  status: string;
}

export interface AppointmentHistoryResponse {
  history: HistoryItem[];
}

export interface ManagementAppointmentItem {
  id: string;
  student: string;
  level: string;
  course: string;
  studentId: string;
  time: string;
  date: string;
  status: string;
  test?: string; // Add test for assessment
  evaluatedBy: string | null;
}

export interface ManagementAppointmentsResponse {
  appointments: ManagementAppointmentItem[];
}

export interface ShiftingAppointmentItem extends Omit<ManagementAppointmentItem, 'test'> {
  currentCourse: string;
  targetCourse: string;
  documents: {
    picture: string;
    grades: string;
    latestCor: string;
    entranceResult: string;
  };
}

export interface ShiftingManagementAppointmentsResponse {
  appointments: ShiftingAppointmentItem[];
}

export interface EvaluateCounselingPayload {
  action: 'evaluate' | 'reschedule';
  forwardToDirector?: boolean;
  reschedType?: 'staff_picked' | 'user_picked';
  newDate?: string;
  newTimeSlot?: string;
}

export interface DirectorEvaluateCounselingPayload {
  action: 'approve' | 'decline';
}

export const appointmentApi = {
  getCounselingAvailability: (year: number, month: number) =>
    api<CounselingAvailabilityResponse>(`/api/appointments/counseling/availability?year=${year}&month=${month}`),

  getAssessmentAvailability: (type: 'Assessment (DAS-Y)' | 'Assessment (DAS-21)', year: number, month: number) =>
    api<AssessmentAvailabilityResponse>(`/api/appointments/assessment/availability?type=${encodeURIComponent(type)}&year=${year}&month=${month}`),

  createCounselingAppointment: (payload: CreateCounselingAppointmentPayload, token: string) =>
    api<CreateCounselingAppointmentResponse>('/api/appointments/counseling', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  createAssessmentAppointment: (payload: CreateAssessmentAppointmentPayload, token: string) =>
    api<CreateAssessmentAppointmentResponse>('/api/appointments/assessment', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  createShiftingAppointment: (payload: CreateShiftingAppointmentPayload, token: string) =>
    api<CreateShiftingAppointmentResponse>('/api/appointments/shifting', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  getLatestShiftingAppointment: (token: string) =>
    api<LatestShiftingAppointmentResponse>('/api/appointments/shifting/latest', { token }),

  getLatestAppointmentByType: (type: string, token: string) =>
    api<LatestAppointmentResponse>(`/api/appointments/latest?type=${encodeURIComponent(type)}`, { token }),

  getShiftingSubmissionStatus: () =>
    api<ShiftingSubmissionStatusResponse>('/api/appointments/shifting/submission-status'),

  getShiftingConfig: () =>
    api<ShiftingConfigResponse>('/api/appointments/shifting/config'),

  updateShiftingConfig: (payload: UpdateShiftingConfigPayload, token: string) =>
    api<{ message: string }>('/api/appointments/shifting/config', {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  getAppointmentHistory: (token: string) =>
    api<AppointmentHistoryResponse>('/api/appointments/history', { token }),

  getManagementAppointments: (token: string) =>
    api<ManagementAppointmentsResponse>('/api/appointments/counseling/management', { token }),

  evaluateCounselingAppointment: (id: string, payload: EvaluateCounselingPayload, token: string) =>
    api<any>(`/api/appointments/counseling/${id}/evaluate`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  directorEvaluateCounselingAppointment: (id: string, payload: DirectorEvaluateCounselingPayload, token: string) =>
    api<any>(`/api/appointments/counseling/${id}/director-evaluate`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  getAssessmentManagementAppointments: (token: string) =>
    api<ManagementAppointmentsResponse>('/api/appointments/assessment/management', { token }),

  evaluateAssessmentAppointment: (id: string, payload: EvaluateCounselingPayload, token: string) =>
    api<any>(`/api/appointments/assessment/${id}/evaluate`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  directorEvaluateAssessmentAppointment: (id: string, payload: DirectorEvaluateCounselingPayload, token: string) =>
    api<any>(`/api/appointments/assessment/${id}/director-evaluate`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  getShiftingManagementAppointments: (token: string) =>
    api<ShiftingManagementAppointmentsResponse>('/api/appointments/shifting/management', { token }),

  evaluateShiftingAppointment: (id: string, payload: EvaluateCounselingPayload, token: string) =>
    api<any>(`/api/appointments/shifting/${id}/evaluate`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  directorEvaluateShiftingAppointment: (id: string, payload: DirectorEvaluateCounselingPayload, token: string) =>
    api<any>(`/api/appointments/shifting/${id}/director-evaluate`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      token
    }),

  getShiftingDocumentSignedUrl: (path: string, token: string) =>
    api<{ signedUrl: string }>('/api/appointments/shifting/signed-url', {
      method: 'POST',
      body: { path },
      token
    })
};

// ------------------------------------------
// Analytics API helpers
// ------------------------------------------

export interface AnalyticsDashboardResponse {
  stats: {
    totalAppointments: number;
    todaysBookings: number;
    approvalRate: string;
    avgReviewTime: string;
    pendingCount: number;
    completedTests: number;
    totalUsers: number;
    activeStaff: number;
  };
  distribution: Array<{ label: string; count: number; percent: number }>;
  topCourses: Array<{ course: string; count: number; trend: string }>;
  topStaff: Array<{ name: string; role: string; count: number }>;
  rolesDistribution: Array<{ role: string; count: number; percent: number }>;
  systemActivity: Array<{ action: string; time: string; type: string }>;
  pendingAppointmentsList?: Array<{
    id: string;
    student: string;
    level: string;
    type: string;
    date: string;
    time: string;
    status: string;
  }>;
}

export interface MyStatsResponse {
  totalManaged: number;
  responseRate: number;
}

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  category: string;
  type: 'user' | 'appointment' | 'system' | 'blog';
  timestamp: string;
  dateFormatted: string;
  relativeTime: string;
}

export const analyticsApi = {
  getAnalyticsDashboardData: (token: string) =>
    api<AnalyticsDashboardResponse>('/api/analytics', { token }),

  getMyStats: (token: string) =>
    api<MyStatsResponse>('/api/analytics/my-stats', { token }),

  getAuditLogs: (token: string) =>
    api<{ auditLogs: AuditLogItem[] }>('/api/analytics/audit-logs', { token }),
};

// ------------------------------------------
// Admin User Management API helpers
// ------------------------------------------

export interface AdminUser {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: string;
  status: string; // 'Active' | 'Pending'
  createdAt: string;
  // Optional — populated when fetched by id
  contactNumber?: string;
  city?: string;
  barangay?: string;
  street?: string;
  sex?: string;
  birthdate?: string;
  occupation?: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber: string;
  city: string;
  barangay: string;
  street: string;
  sex: string;
  birthdate: string;
  isWMSU: boolean;
  isFaculty: boolean;
  occupation: string;
  educationLevel: string;
  school: string;
  course: string;
  gradeLevel: string;
  track: string;
  schoolId: string;
  lrn: string;
  employeeId: string;
  role: string;
}

export interface UpdateAdminUserPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber?: string;
  city?: string;
  barangay?: string;
  street?: string;
  sex?: string;
  birthdate?: string;
  occupation?: string;
}

export const adminApi = {
  getUsers: (token: string) =>
    api<AdminUsersResponse>('/api/admin/users', { token }),

  getUserById: (id: string, token: string) =>
    api<AdminUser>(`/api/admin/users/${id}`, { token }),

  createUser: (payload: CreateAdminUserPayload, token: string) =>
    api<{ message: string }>('/api/admin/users/create', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      token,
    }),

  updateUser: (id: string, payload: UpdateAdminUserPayload, token: string) =>
    api<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: payload as unknown as Record<string, unknown>,
      token,
    }),

  deleteUser: (id: string, token: string) =>
    api<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// ------------------------------------------
// Notification API helpers
// ------------------------------------------

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export const notificationApi = {
  getNotifications: (token: string) =>
    api<NotificationsResponse>('/api/notifications', { token }),

  markAsRead: (id: string, token: string) =>
    api<{ message: string }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
      token,
    }),

  markAllAsRead: (token: string) =>
    api<{ message: string }>('/api/notifications/read-all', {
      method: 'PUT',
      token,
    }),
};

