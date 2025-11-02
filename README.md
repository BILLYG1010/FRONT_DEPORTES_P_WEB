# Dashboard Frontend — React + Vite + Tailwind

Interfaz web **administrativa** (dashboard) con diseño **minimalista**, **responsive** y preparada para conectar a una **API externa** (por ejemplo, .NET).  
> **Nota**: Este repositorio se centra en **UI/UX y flujo**. Los **esquemas de base de datos** y contratos finales de backend **no están definidos al 100%** todavía.

---

## ✨ Módulos incluidos

- **Clientes**: vistas **Kanban** y **Lista** (búsqueda local).
- **Inventario**: vistas **Kanban** (imagen cuadrada) y **Lista**.
- **Facturas**: vistas **Kanban** y **Lista** con campos clave.
- **Ajustes**:
  - **Generales**: idioma, zona horaria, moneda, notificaciones.
  - **Empresa**: logo, nombre legal, **NIT**, contacto, **FEL** (proveedor, ambiente, serie, API Key, frases FEL).
  - **Usuario**: perfil, avatar, rol, 2FA, administración de usuarios.
- **Layout**:
  - **Sidebar** de navegación.
  - **Topbar** con breadcrumb, **avatar + nombre + rol** y **notificaciones**.

> Paleta: Tailwind (slate) + acentos **azules en gradiente**. Componentes limpios y consistentes.

---

## 🧰 Stack

- **React 18+** (SPA con React Router)
- **Vite** (dev server y build)
- **Tailwind CSS**
- **Fetch** con envoltura propia (timeout, headers, errores, baseURL por ambiente)
- **Capa de servicios** (UI desacoplada del transporte HTTP)

> Futuro opcional: `@tanstack/react-query`, validación `zod`, etc.

---

## 🚀 Requisitos

- **Node.js 18+** (recomendado 20+)
- **npm 9+** (o pnpm/yarn)

---

## 📦 Instalación rápida

```bash
# 1) Clonar
git clone <tu-repo.git>
cd <tu-repo>

# 2) Instalar dependencias
npm install

# 3) Variables de entorno (ver sección Environments)
cp .env.development.example .env.development
cp .env.production.example  .env.production

# 4) Desarrollo
npm run dev   # http://localhost:5173

# 5) Build de producción
npm run build # genera /dist
npm run preview
