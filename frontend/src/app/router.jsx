import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout.jsx";
import { PageLoader } from "../components/ui/PageLoader.jsx";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser.js";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { RegisterPage } from "../pages/RegisterPage.jsx";
import { AccountsPage } from "../pages/AccountsPage.jsx";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage.jsx";
import { ResetPasswordPage } from "../pages/ResetPasswordPage.jsx";
import { VerifyEmailPage } from "../pages/VerifyEmailPage.jsx";
import { TransactionsPage } from "../pages/TransactionsPage.jsx";
import { BudgetsPage } from "../pages/BudgetsPage.jsx";
import { AnalyticsPage } from "../pages/AnalyticsPage.jsx";

const ProtectedRoute = ({ children }) => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <PageLoader label="Checking your session" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <PageLoader label="Loading MoneyLens" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AccountsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TransactionsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BudgetsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
