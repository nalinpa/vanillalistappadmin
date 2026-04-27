import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./pages/AdminLayout";
import LoginPage from "./pages/LoginPage";
import NotAdminPage from "./pages/NotAdminPage";
import __Location__sPage from "./pages/__Location__sPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/__;ocation__s" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/not-admin", element: <NotAdminPage /> },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "__locations__", element: <__Location__sPage /> },
      // later: { path: "completions", element: <CompletionsPage /> },
    ],
  },
]);
