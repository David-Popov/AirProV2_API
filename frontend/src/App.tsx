import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import MontagesPage from '@/pages/MontagesPage'
import EmployeesPage from '@/pages/EmployeesPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { ProtectedRoute, DashboardLayout } from '@/components/layout'

function App() {
  return (
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
            <Route path="/employees" element={<EmployeesPage />} />
            {/* Redirect /settings for now */}
            <Route path="/settings" element={<Navigate to="/dashboard" />} />
             {/* Redirect /air-conditioners for now */}
            <Route path="/air-conditioners" element={<Navigate to="/dashboard" />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster richColors position="bottom-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
