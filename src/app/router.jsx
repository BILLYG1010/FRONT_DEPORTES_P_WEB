import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Tables from "../pages/Tables";
import Notifications from "../pages/Notifications";
import Clientes from "../pages/Clientes";  
import Inventario from "../pages/Inventario"; 
import Facturas from "../pages/Facturas";

const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/profile", element: <Profile /> },
      { path: "/tables", element: <Tables /> },
      { path: "/notifications", element: <Notifications /> },
      { path: "/clientes", element: <Clientes /> },
      { path: "/inventario", element: <Inventario /> },
      { path: "/facturas", element: <Facturas /> },
    ],
  },
]);

export default router;
