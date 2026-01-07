import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
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
import { ProtectedRoute, DashboardLayout } from '@/components/layout'
import { ThemeProvider } from '@/components/theme-provider'

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
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/montages" element={<MontagesPage />} />
              <Route path="/montages/:id" element={<MontageDetailsPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
              <Route path="/air-conditioners" element={<AirConditionersPage />} />
              <Route path="/air-conditioners/:id" element={<AirConditionerDetailsPage />} />
              <Route path="/error-codes" element={<ErrorCodesPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
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

