import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./pages/AdminLayout";
import LoginPage from "./pages/LoginPage";
import NotAdminPage from "./pages/NotAdminPage";
import ConesPage from "./pages/ConesPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/cones" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/not-admin", element: <NotAdminPage /> },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "cones", element: <ConesPage /> },
      // later: { path: "completions", element: <CompletionsPage /> },
    ],
  },
]);
