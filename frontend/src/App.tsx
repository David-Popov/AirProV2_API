import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
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
import NotFoundPage from '@/pages/NotFoundPage'
import { SubscriptionPage, SubscriptionSuccessPage } from '@/pages/subscription'
import { ProtectedRoute, DashboardLayout } from '@/components/layout'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
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
              <Route path="/montages" element={<ErrorBoundary><MontagesPage /></ErrorBoundary>} />
              <Route path="/montages/:id" element={<ErrorBoundary><MontageDetailsPage /></ErrorBoundary>} />
              <Route path="/employees" element={<ProtectedRoute roles={['Manager', 'Admin']}><ErrorBoundary><EmployeesPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/employees/:id" element={<ProtectedRoute roles={['Manager', 'Admin']}><ErrorBoundary><EmployeeDetailsPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/air-conditioners" element={<ErrorBoundary><AirConditionersPage /></ErrorBoundary>} />
              <Route path="/air-conditioners/:id" element={<ErrorBoundary><AirConditionerDetailsPage /></ErrorBoundary>} />
              <Route path="/error-codes" element={<ErrorBoundary><ErrorCodesPage /></ErrorBoundary>} />
              <Route path="/companies" element={<ErrorBoundary><CompaniesPage /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              <Route path="/subscription" element={<ErrorBoundary><SubscriptionPage /></ErrorBoundary>} />
              <Route path="/subscription/success" element={<ErrorBoundary><SubscriptionSuccessPage /></ErrorBoundary>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster richColors position="bottom-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
