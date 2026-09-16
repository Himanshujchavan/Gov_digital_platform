import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { getDefaultDashboard, Roles } from './utils/roleGuards';

// Layouts
import { CitizenLayout } from './layouts/CitizenLayout';
import { OfficerLayout } from './layouts/OfficerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Citizen Pages
import { ServiceListPage } from './pages/citizen/ServiceListPage';
import { ApplicationFormPage } from './pages/citizen/ApplicationFormPage';
import { MyApplicationsPage } from './pages/citizen/MyApplicationsPage';
import { ApplicationTimelinePage } from './pages/citizen/ApplicationTimelinePage';
import { ConsentRequestsPage } from './pages/citizen/ConsentRequestsPage';

// Officer Pages
import { PendingReviewsPage } from './pages/officer/PendingReviewsPage';
import { ApplicationReviewPage } from './pages/officer/ApplicationReviewPage';
import { CitizenProfilePage } from './pages/officer/CitizenProfilePage';

// Admin Pages
import { SystemStatsPage } from './pages/admin/SystemStatsPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { DuplicatesReviewPage } from './pages/admin/DuplicatesReviewPage';
import { DataQualityDashboard } from './pages/admin/DataQualityDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDefaultDashboard(user?.role)} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen Routes */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[Roles.CITIZEN]}>
                  <CitizenLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="services" replace />} />
            <Route path="services" element={<ServiceListPage />} />
            <Route path="apply/:schemeId" element={<ApplicationFormPage />} />
            <Route path="applications" element={<MyApplicationsPage />} />
            <Route path="applications/:id" element={<ApplicationTimelinePage />} />
            <Route path="consent" element={<ConsentRequestsPage />} />
          </Route>

          {/* Officer Routes */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[Roles.OFFICER]}>
                  <OfficerLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="pending-reviews" replace />} />
            <Route path="pending-reviews" element={<PendingReviewsPage />} />
            <Route path="review/:id" element={<ApplicationReviewPage />} />
            <Route path="citizen-360/:masterId" element={<CitizenProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[Roles.ADMIN]}>
                  <AdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="system-stats" replace />} />
            <Route path="system-stats" element={<SystemStatsPage />} />
            <Route path="audit-logs" element={<AuditLogPage />} />
            <Route path="duplicates" element={<DuplicatesReviewPage />} />
            <Route path="data-quality" element={<DataQualityDashboard />} />
          </Route>

          {/* Root & Catch-all */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
