import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ConfirmEmailPage from '@/pages/ConfirmEmailPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import ConfirmEmailChangePage from '@/pages/ConfirmEmailChangePage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import InventoryItemHistoryPage from '@/pages/InventoryItemHistoryPage'
import MontagesPage from '@/pages/MontagesPage'
import MontageDetailsPage from '@/pages/MontageDetailsPage'
import EmployeesPage from '@/pages/EmployeesPage'
import EmployeeDetailsPage from '@/pages/EmployeeDetailsPage'
import AirConditionersPage from '@/pages/AirConditionersPage'
import AirConditionerDetailsPage from '@/pages/AirConditionerDetailsPage'
import CompaniesPage from '@/pages/CompaniesPage'
import ErrorCodesPage from '@/pages/ErrorCodesPage'
import SettingsPage from '@/pages/SettingsPage'
import ContactPage from '@/pages/ContactPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ReportedProblemsPage from '@/pages/ReportedProblemsPage'
import { AdminCompaniesPage, AdminUsersPage, AdminMontagesPage } from '@/pages/admin'
import { SubscriptionPage, SubscriptionSuccessPage } from '@/pages/subscription'
import { ProtectedRoute, DashboardLayout } from '@/components/layout'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PwaUpdateNotifier } from '@/components/PwaUpdateNotifier'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/confirm-email" element={<ConfirmEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/confirm-email-change" element={<ConfirmEmailChangePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Protected Routes */}
            <Route 
              element={
                <ProtectedRoute>
                   <ErrorBoundary>
                      <DashboardLayout />
                   </ErrorBoundary>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<ProtectedRoute roles={['Manager']}><ErrorBoundary><DashboardPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute roles={['Manager', 'User']}><ErrorBoundary><InventoryPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/inventory/:id/history" element={<ProtectedRoute roles={['Manager', 'User']}><ErrorBoundary><InventoryItemHistoryPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/montages" element={<ProtectedRoute roles={['Manager', 'User']}><ErrorBoundary><MontagesPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/montages/:id" element={<ProtectedRoute roles={['Manager', 'User']}><ErrorBoundary><MontageDetailsPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute roles={['Manager']}><ErrorBoundary><EmployeesPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/employees/:id" element={<ProtectedRoute roles={['Manager']}><ErrorBoundary><EmployeeDetailsPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/air-conditioners" element={<ErrorBoundary><AirConditionersPage /></ErrorBoundary>} />
              <Route path="/air-conditioners/:id" element={<ErrorBoundary><AirConditionerDetailsPage /></ErrorBoundary>} />
              <Route path="/error-codes" element={<ErrorBoundary><ErrorCodesPage /></ErrorBoundary>} />
              <Route path="/companies" element={<ProtectedRoute roles={['Admin']}><ErrorBoundary><CompaniesPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/reported-problems" element={<ProtectedRoute roles={['Admin']}><ErrorBoundary><ReportedProblemsPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              <Route path="/subscription" element={<ErrorBoundary><SubscriptionPage /></ErrorBoundary>} />
              <Route path="/subscription/success" element={<ErrorBoundary><SubscriptionSuccessPage /></ErrorBoundary>} />
              
              {/* Admin Routes */}
              <Route path="/admin/companies" element={<ProtectedRoute roles={['Admin']}><ErrorBoundary><AdminCompaniesPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['Admin']}><ErrorBoundary><AdminUsersPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/admin/montages" element={<ProtectedRoute roles={['Admin']}><ErrorBoundary><AdminMontagesPage /></ErrorBoundary></ProtectedRoute>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster richColors position="bottom-right" />
          <PwaUpdateNotifier />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
