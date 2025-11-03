// src/app/router.jsx
import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import GuestOnlyRoute from "../components/GuestOnlyRoute";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Tables from "../pages/Tables";
import Notifications from "../pages/Notifications";
import Clientes from "../pages/ClientesViews/Clientes";
import Inventario from "../pages/InventarioViews/Inventario";
import Facturas from "../pages/FacturasViews/Facturas";
import Ajustes from "../pages/Ajustes";
import ClienteForm from "../pages/ClientesViews/ClientesForm";
import Login from "../pages/Auth/Login"; // <-- ruta correcta

const router = createBrowserRouter([
  // Ruta pública de login (solo para invitados)
  {
    path: "/login",
    element: (
      <GuestOnlyRoute>
        <Login />
      </GuestOnlyRoute>
    ),
  },

  // Zona protegida: requiere sesión
  {
    element: <ProtectedRoute />, // protege todo lo de abajo
    children: [
      {
        element: <DashboardLayout />, // tu layout con sidebar/topbar
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/profile", element: <Profile /> },
          { path: "/tables", element: <Tables /> },
          { path: "/notifications", element: <Notifications /> },
          { path: "/clientes", element: <Clientes /> },
          { path: "/clientes/new", element: <ClienteForm /> },
          { path: "/clientes/:id", element: <ClienteForm /> },
          { path: "/inventario", element: <Inventario /> },
          { path: "/facturas", element: <Facturas /> },
          { path: "/ajustes", element: <Ajustes /> },
        ],
      },
    ],
  },
]);

export default router;
