import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminAppointments from './pages/AdminAppointments'
import AdminStaff from './pages/AdminStaff'
import AdminServices from './pages/AdminServices'
import AdminCustomers from './pages/AdminCustomers'
import AdminPayments from './pages/AdminPayments'
import AdminSchedule from './pages/AdminSchedule'
import AdminReports from './pages/AdminReports'
import AdminAdmins from './pages/AdminAdmins'
import AdminSettings from './pages/AdminSettings'

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Root redirect to dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Admin Login */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
