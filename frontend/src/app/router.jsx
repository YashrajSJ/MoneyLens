import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout.jsx";
import { PageLoader } from "../components/ui/PageLoader.jsx";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser.js";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { RegisterPage } from "../pages/RegisterPage.jsx";
import { AccountsPage } from "../pages/AccountsPage.jsx";

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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
