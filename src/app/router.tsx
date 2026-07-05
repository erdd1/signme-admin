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
import { ChurchDetailPage } from '@/features/churches/pages/ChurchDetailPage'
import { ChurchesListPage } from '@/features/churches/pages/ChurchesListPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { EvenementDetailPage } from '@/features/evenements/pages/EvenementDetailPage'
import { EvenementsListPage } from '@/features/evenements/pages/EvenementsListPage'
import { ContributionPaymentsPage } from '@/features/payments/contributions/pages/ContributionPaymentsPage'
import { SignaturePaymentsPage } from '@/features/payments/signatures/pages/SignaturePaymentsPage'
import { PublicationsListPage } from '@/features/publications/pages/PublicationsListPage'
import { SignaturesListPage } from '@/features/signatures/pages/SignaturesListPage'
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
                <Route path="/eglises" element={<ChurchesListPage />} />
                <Route path="/eglises/:id" element={<ChurchDetailPage />} />
                <Route path="/utilisateurs" element={<UsersListPage />} />
                <Route path="/publications" element={<PublicationsListPage />} />
                <Route path="/signatures" element={<SignaturesListPage />} />
                <Route path="/evenements" element={<EvenementsListPage />} />
                <Route path="/evenements/:uuid" element={<EvenementDetailPage />} />
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
