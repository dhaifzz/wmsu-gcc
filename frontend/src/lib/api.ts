export const API_URL = import.meta.env.VITE_API_URL || 'https://gcc-backend-9t7w.onrender.com';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
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
    error: !response.ok && data?.error ? data.error : undefined,
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
  courseId?: string | null;
  courseName?: string | null;
  collegeName?: string | null;
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
  } | null;
}

export interface ShiftingSubmissionStatusResponse {
  isOpen: boolean;
  status: string;
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

export const analyticsApi = {
  getAnalyticsDashboardData: (token: string) =>
    api<AnalyticsDashboardResponse>('/api/analytics', { token }),

  getMyStats: (token: string) =>
    api<MyStatsResponse>('/api/analytics/my-stats', { token }),
};
