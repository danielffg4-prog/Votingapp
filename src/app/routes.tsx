import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import DashboardPage from "./pages/DashboardPage";
import { useApp } from "./context/AppContext";

function RequireAuth({ children, role }: { children: React.ReactNode; role?: "admin" | "user" }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === "admin" ? "/admin" : "/user"} replace />;
  }
  return <>{children}</>;
}

function Root() {
  return <Layout><Outlet /></Layout>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: (
      <Layout>
        <RequireAuth role="admin">
          <AdminPage />
        </RequireAuth>
      </Layout>
    ),
  },
  {
    path: "/user",
    element: (
      <Layout>
        <RequireAuth role="user">
          <UserPage />
        </RequireAuth>
      </Layout>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Layout>
        <RequireAuth>
          <DashboardPage />
        </RequireAuth>
      </Layout>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);