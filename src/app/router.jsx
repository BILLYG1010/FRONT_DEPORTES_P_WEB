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
import ClienteForm from "../pages/ClientesViews/ClientesForm";

import Inventario from "../pages/InventarioViews/Inventario";
// 👇 tu archivo se llama inventarioForm
import InventarioForm from "../pages/InventarioViews/InventarioForm";

import Facturas from "../pages/FacturasViews/Facturas";
import Ajustes from "../pages/Ajustes";

import Login from "../pages/Auth/Login"; // <-- ruta correcta

import FacturasForm from "../pages/FacturasViews/FacturasForm";



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

          // ===== CLIENTES =====
          { path: "/clientes", element: <Clientes /> },
          { path: "/clientes/new", element: <ClienteForm /> },
          { path: "/clientes/:id", element: <ClienteForm /> },

          // ===== INVENTARIO (Productos) =====
          { path: "/inventario", element: <Inventario /> },
          { path: "/inventario/new", element: <InventarioForm /> },
          { path: "/inventario/:id", element: <InventarioForm /> },
          // Futuro:
          // { path: "/inventario/import-export", element: <InventarioImportExport /> },

          // ===== FACTURAS / AJUSTES =====
          { path: "/facturas", element: <Facturas /> },
          { path: "/ajustes", element: <Ajustes /> },
          { path: "/facturas", element: <Facturas /> },
          { path: "/facturas/new", element: <FacturasForm /> },
          { path: "/facturas/:id", element: <FacturasForm /> },
        ],
      },
    ],
  },
]);

export default router;
