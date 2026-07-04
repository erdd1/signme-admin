import { BrowserRouter, Route, Routes } from 'react-router'

import { ProtectedRoute } from '@/core/guards/ProtectedRoute'
import { RoleGuard } from '@/core/guards/RoleGuard'
import { AdminLayout } from '@/core/layouts/AdminLayout'
import { AuthLayout } from '@/core/layouts/AuthLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

import { NotFoundPage } from './NotFoundPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
