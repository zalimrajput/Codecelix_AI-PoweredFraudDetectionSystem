import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './layouts/AppShell';
import { RoleGuard } from './layouts/RoleGuard';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';
import { FraudNetworkPage } from './pages/FraudNetworkPage';
import { RulesPage } from './pages/RulesPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Platform Shell */}
              <Route path="/" element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard: All Roles */}
                <Route
                  path="dashboard"
                  element={
                    <RoleGuard allowedRoles={['ADMIN', 'BUSINESS_MANAGER', 'ANALYST']}>
                      <DashboardPage />
                    </RoleGuard>
                  }
                />

                {/* Transactions: All Roles */}
                <Route
                  path="transactions"
                  element={
                    <RoleGuard allowedRoles={['ADMIN', 'BUSINESS_MANAGER', 'ANALYST']}>
                      <TransactionsPage />
                    </RoleGuard>
                  }
                />

                {/* Investigations: ADMIN & ANALYST */}
                <Route
                  path="investigations"
                  element={
                    <RoleGuard allowedRoles={['ADMIN', 'ANALYST']}>
                      <InvestigationsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="investigations/:id"
                  element={
                    <RoleGuard allowedRoles={['ADMIN', 'ANALYST']}>
                      <InvestigationDetailPage />
                    </RoleGuard>
                  }
                />

                {/* Fraud Network: All Roles */}
                <Route
                  path="network"
                  element={
                    <RoleGuard allowedRoles={['ADMIN', 'BUSINESS_MANAGER', 'ANALYST']}>
                      <FraudNetworkPage />
                    </RoleGuard>
                  }
                />

                {/* Rules Engine: ADMIN Only */}
                <Route
                  path="rules"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <RulesPage />
                    </RoleGuard>
                  }
                />

                {/* Reports: ADMIN & BUSINESS_MANAGER */}
                <Route
                  path="reports"
                  element={
                    <RoleGuard allowedRoles={['ADMIN', 'BUSINESS_MANAGER']}>
                      <ReportsPage />
                    </RoleGuard>
                  }
                />

                {/* Users & Access Governance: ADMIN Only */}
                <Route
                  path="users"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <UsersPage />
                    </RoleGuard>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
