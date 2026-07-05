import { BrowserRouter, Route, Routes } from 'react-router'

import { MfaGuard, MfaSetupRoute } from '@/core/guards/MfaGuard'
import { ProtectedRoute } from '@/core/guards/ProtectedRoute'
import { RoleGuard } from '@/core/guards/RoleGuard'
import { AdminLayout } from '@/core/layouts/AdminLayout'
import { AuthLayout } from '@/core/layouts/AuthLayout'
import { AccountPage } from '@/features/auth/pages/AccountPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { MfaSetupPage } from '@/features/auth/pages/MfaSetupPage'
import { SecurityPage } from '@/features/auth/pages/SecurityPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ContributionPaymentsPage } from '@/features/payments/contributions/pages/ContributionPaymentsPage'
import { SignaturePaymentsPage } from '@/features/payments/signatures/pages/SignaturePaymentsPage'
import { UsersListPage } from '@/features/users/pages/UsersListPage'

import { NotFoundPage } from './NotFoundPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard />}>
              <Route element={<MfaSetupRoute />}>
                <Route path="/mfa-setup" element={<MfaSetupPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard />}>
            <Route element={<MfaGuard />}>
              <Route element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="/utilisateurs" element={<UsersListPage />} />
                <Route path="/paiements/signatures" element={<SignaturePaymentsPage />} />
                <Route path="/paiements/contributions" element={<ContributionPaymentsPage />} />
                <Route path="/compte" element={<AccountPage />} />
                <Route path="/securite" element={<SecurityPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
