// src/pages/Ajustes.jsx
import { useMemo, useState } from "react";

/**
 * Ajustes.jsx
 * - Pestañas: "Empresa" (ajustes generales FEL y datos fiscales) y "Usuarios".
 * - Estilo minimal, consistente (slate + acentos azul/gradient).
 * - Solo UI (sin integraciones); los handlers hacen console.log por ahora.
 */

const INITIAL_EMPRESA = {
  logoUrl: "https://via.placeholder.com/160?text=LOGO",
  nombre: "Mi Empresa, S.A.",
  nit: "1234567-8",
  celular: "+502 5555 0000",
  email: "admin@miempresa.gt",
  proveedorFel: "infile", // infile | digifact | otro
  ambienteFel: "produccion", // produccion | pruebas
  serieFel: "FACT",
  establecimiento: "1",
  apiKeyFel: "",
  frasesFel: [
    "Gracias por su compra.",
    "Documento certificado en línea (FEL).",
  ],
};

const INITIAL_USUARIOS = [
  {
    id: 1,
    nombre: "María López",
    email: "maria@miempresa.gt",
    rol: "Administrador",
    estado: "Activo",
    ultimoAcceso: "2025-10-30 14:22",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: 2,
    nombre: "Juan Pérez",
    email: "juan@miempresa.gt",
    rol: "Vendedor",
    estado: "Activo",
    ultimoAcceso: "2025-10-29 09:05",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    id: 3,
    nombre: "Ana Gómez",
    email: "ana@miempresa.gt",
    rol: "Contabilidad",
    estado: "Inactivo",
    ultimoAcceso: "2025-10-10 18:11",
    avatar: "https://i.pravatar.cc/100?img=22",
  },
];

export default function Ajustes() {
  const [tab, setTab] = useState("empresa"); // empresa | usuarios

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Ajustes</h1>
          <p className="text-sm text-slate-500">
            Configuración general de la empresa y preferencias de usuarios.
          </p>
        </div>

        {/* Tabs */}
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setTab("empresa")}
            className={[
              "px-4 py-2 text-sm",
              tab === "empresa"
                ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white"
                : "text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            Empresa
          </button>
          <button
            type="button"
            onClick={() => setTab("usuarios")}
            className={[
              "px-4 py-2 text-sm",
              tab === "usuarios"
                ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white"
                : "text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            Usuarios
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === "empresa" ? <EmpresaForm /> : <UsuariosSettings />}
    </div>
  );
}

/* =========================
   Pestaña: Empresa
   ========================= */
function EmpresaForm() {
  const [form, setForm] = useState(INITIAL_EMPRESA);

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, logoUrl: url }));
  };

  const addFrase = () => {
    setForm((f) => ({ ...f, frasesFel: [...f.frasesFel, ""] }));
  };

  const updateFrase = (idx, value) => {
    const next = [...form.frasesFel];
    next[idx] = value;
    setForm((f) => ({ ...f, frasesFel: next }));
  };

  const removeFrase = (idx) => {
    const next = form.frasesFel.filter((_, i) => i !== idx);
    setForm((f) => ({ ...f, frasesFel: next }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Guardando ajustes de empresa:", form);
  };

  const handleReset = () => setForm(INITIAL_EMPRESA);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      autoComplete="off"
      noValidate
    >
      {/* Card: Identidad */}
      <section className="rounded-xl bg-white p-5 shadow-md">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Identidad de la empresa
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Logo */}
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Logotipo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Cambiar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogo}
                />
              </label>
            </div>
          </div>

          {/* Nombre */}
          <Input
            label="Nombre legal"
            placeholder="Mi Empresa, S.A."
            value={form.nombre}
            onChange={handleChange("nombre")}
          />

          {/* NIT */}
          <Input
            label="NIT"
            placeholder="1234567-8"
            value={form.nit}
            onChange={handleChange("nit")}
          />

          {/* Celular */}
          <Input
            label="Celular"
            placeholder="+502 0000 0000"
            value={form.celular}
            onChange={handleChange("celular")}
          />

          {/* Email */}
          <Input
            label="Correo electrónico"
            placeholder="facturacion@miempresa.gt"
            value={form.email}
            onChange={handleChange("email")}
          />

          {/* Serie y Establecimiento */}
          <Input
            label="Serie FEL"
            placeholder="FACT"
            value={form.serieFel}
            onChange={handleChange("serieFel")}
          />
          <Input
            label="No. Establecimiento (FEL)"
            placeholder="1"
            value={form.establecimiento}
            onChange={handleChange("establecimiento")}
          />
        </div>
      </section>

      {/* Card: FEL */}
      <section className="rounded-xl bg-white p-5 shadow-md">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Configuración FEL
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Proveedor FEL */}
          <Select
            label="Proveedor FEL"
            value={form.proveedorFel}
            onChange={handleChange("proveedorFel")}
            options={[
              { value: "infile", label: "Infile" },
              { value: "digifact", label: "Digifact" },
              { value: "otro", label: "Otro" },
            ]}
          />

          {/* Ambiente */}
          <Select
            label="Ambiente"
            value={form.ambienteFel}
            onChange={handleChange("ambienteFel")}
            options={[
              { value: "produccion", label: "Producción" },
              { value: "pruebas", label: "Pruebas" },
            ]}
          />

          {/* API KEY (oculta) */}
          <Password
            label="Clave API FEL"
            placeholder="••••••••••••••"
            value={form.apiKeyFel}
            onChange={handleChange("apiKeyFel")}
          />
        </div>

        {/* Frases FEL */}
        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Frases FEL (se muestran en la factura)
          </label>

          <div className="space-y-3">
            {form.frasesFel.map((fr, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <textarea
                  value={fr}
                  onChange={(e) => updateFrase(idx, e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-2 focus:border-blue-500"
                  placeholder="Ej: Documento certificado en línea (FEL)."
                />
                <button
                  type="button"
                  onClick={() => removeFrase(idx)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Eliminar frase"
                  title="Eliminar"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 7h12v2H6V7zm2 3h2v8H8v-8zm6 0h2v8h-2v-8zM9 4h6l1 2H8l1-2z" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addFrase}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Añadir frase
            </button>
          </div>
        </div>
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Restablecer
        </button>
        <button
          type="submit"
          className="rounded-md bg-gradient-to-tr from-blue-600 to-blue-400 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}

/* =========================
   Pestaña: Usuarios
   ========================= */
function UsuariosSettings() {
  const [usuarios] = useState(INITIAL_USUARIOS);

  const activos = useMemo(
    () => usuarios.filter((u) => u.estado === "Activo").length,
    [usuarios]
  );

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <section className="rounded-xl bg-white p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Usuarios del sistema
            </h2>
            <p className="text-xs text-slate-500">
              Total: {usuarios.length} · Activos: {activos}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Invitar usuario
            </button>
            <button
              type="button"
              className="rounded-md bg-gradient-to-tr from-blue-600 to-blue-400 px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Nuevo usuario
            </button>
          </div>
        </div>
      </section>

      {/* Tabla */}
      <section className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] table-auto">
            <thead className="bg-slate-50">
              <tr>
                <Th>Usuario</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th>Último acceso</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-slate-200">
                          <img
                            src={u.avatar}
                            alt={u.nombre}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {u.nombre}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <p className="truncate text-sm text-slate-700">
                        {u.email}
                      </p>
                    </Td>
                    <Td>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-200">
                        {u.rol}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-xs ring-1",
                          u.estado === "Activo"
                            ? "bg-green-100 text-green-700 ring-green-200"
                            : "bg-slate-100 text-slate-700 ring-slate-200",
                        ].join(" ")}
                      >
                        {u.estado}
                      </span>
                    </Td>
                    <Td>
                      <p className="text-sm text-slate-700">{u.ultimoAcceso}</p>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <IconButton title="Ver">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 5c5.523 0 10 5 10 7s-4.477 7-10 7S2 14 2 12s4.477-7 10-7zm0 3a4 4 0 100 8 4 4 0 000-8z" />
                          </svg>
                        </IconButton>
                        <IconButton title="Editar">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 000-1.42L18.37 3.29a1.004 1.004 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
                          </svg>
                        </IconButton>
                        <IconButton title="Desactivar">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M7 4h10l1 2H6l1-2zm0 4h10v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8zm2 2v8h6v-8H9z" />
                          </svg>
                        </IconButton>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Otros ajustes (ejemplo simple) */}
      <section className="rounded-xl bg-white p-5 shadow-md">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Preferencias de cuenta
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Select
            label="Zona horaria"
            value="America/Guatemala"
            onChange={() => {}}
            options={[{ value: "America/Guatemala", label: "America/Guatemala" }]}
          />
          <Select
            label="Idioma"
            value="es"
            onChange={() => {}}
            options={[
              { value: "es", label: "Español" },
              { value: "en", label: "English" },
            ]}
          />
          <Select
            label="Formato de fecha"
            value="DD/MM/YYYY"
            onChange={() => {}}
            options={[
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

/* =========================
   UI Helpers
   ========================= */
function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-2 focus:border-blue-500"
      />
    </label>
  );
}

function Password({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-2 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          aria-label={show ? "Ocultar" : "Mostrar"}
          title={show ? "Ocultar" : "Mostrar"}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            {show ? (
              <path d="M3 3l18 18-1.5 1.5-2.4-2.4A11.9 11.9 0 0112 19C6.477 19 2 12 2 12a22.8 22.8 0 014.7-5.7L1.5 4.5 3 3zm13.3 13.3l-1.6-1.6a4 4 0 01-5.4-5.4L7.7 7.7A10.8 10.8 0 004 12s4.477 7 8 7c1.7 0 3.3-.6 4.7-1.7zM12 7a5 5 0 015 5c0 .7-.15 1.3-.4 1.9l-1.5-1.5A3.5 3.5 0 0012 8.5V7z" />
            ) : (
              <path d="M12 5c5.523 0 10 5 10 7s-4.477 7-10 7S2 14 2 12s4.477-7 10-7zm0 3a4 4 0 100 8 4 4 0 000-8z" />
            )}
          </svg>
        </button>
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-2 focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function IconButton({ children, title }) {
  return (
    <button
      type="button"
      title={title}
      className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}
