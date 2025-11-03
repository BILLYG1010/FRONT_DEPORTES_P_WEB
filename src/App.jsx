// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
import Login from "./pages/Auth/Login";
import Clientes from "./pages/ClientesViews/Clientes";          // ya existente
import ClienteForm from "./pages/ClientesViews/ClienteForm";    // ya existente

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* público */}
          <Route path="/login" element={<Login />} />

          {/* protegido */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/clientes" replace />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/new" element={<ClienteForm />} />
            <Route path="/clientes/:id" element={<ClienteForm />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/clientes" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
