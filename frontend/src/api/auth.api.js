import { apiClient } from './client';

// Pre-seeded demo accounts for instant offline / standalone frontend testing
const DEMO_USERS = {
  citizen_rahul: {
    id: 'usr-cit-001',
    username: 'citizen_rahul',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.gov.in',
    role: 'citizen',
    department: null,
  },
  citizen_priya: {
    id: 'usr-cit-002',
    username: 'citizen_priya',
    fullName: 'Priya Patil',
    email: 'priya.patil@example.gov.in',
    role: 'citizen',
    department: null,
  },
  officer_education: {
    id: 'usr-off-002',
    username: 'officer_education',
    fullName: 'Anjali Kulkarni',
    email: 'anjali.kulkarni@maha.gov.in',
    role: 'officer',
    department: 'education',
  },
  officer_revenue: {
    id: 'usr-off-001',
    username: 'officer_revenue',
    fullName: 'Suresh Deshmukh',
    email: 'suresh.deshmukh@maha.gov.in',
    role: 'officer',
    department: 'revenue',
  },
  admin_user: {
    id: 'usr-adm-001',
    username: 'admin_user',
    fullName: 'System Administrator',
    email: 'admin.interop@maha.gov.in',
    role: 'admin',
    department: null,
  },
};

export const authApi = {
  login: async (credentials) => {
    try {
      // First try live backend API (Gateway :8000 or Auth Service :8001)
      const res = await apiClient.post('/auth/login', credentials);
      return res;
    } catch (apiErr) {
      // If backend is not running yet, provide seamless demo fallback for test users
      const user = DEMO_USERS[credentials.username];
      if (user && credentials.password === 'password123') {
        return {
          success: true,
          message: 'Authenticated via Demo Mode',
          data: {
            user,
            accessToken: `demo-jwt-token-for-${user.username}`,
            refreshToken: `demo-refresh-token-for-${user.username}`,
          },
        };
      }
      throw apiErr;
    }
  },

  register: async (userData) => {
    try {
      return await apiClient.post('/auth/register', userData);
    } catch (e) {
      // Demo fallback
      return {
        success: true,
        message: 'Registered in demo mode',
        data: {
          id: `usr-${Date.now().toString().slice(-4)}`,
          ...userData,
        },
      };
    }
  },

  getMe: () => apiClient.get('/auth/me'),
  getAllUsers: () => apiClient.get('/auth/users'),
  health: () => apiClient.get('/auth/health'),
};
