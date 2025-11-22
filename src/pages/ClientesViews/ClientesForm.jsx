// src/pages/ClientesViews/ClienteForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCliente, upsertCliente } from "../../services/clientes";

const safe = (v, fb = "") => (v == null ? fb : v);

/**
 * Adapter defensivo por si el service devuelve:
 * - DTO puro (.NET): id_cliente, activo 0/1, etc.
 * - o modelo ya mapeado: id, activo boolean, etc.
 */
const mapClienteFromApi = (c = {}) => ({
  id_cliente: c.id_cliente ?? c.id ?? 0,
  nit: c.nit ?? "",
  nombre: c.nombre ?? "",
  direccion: c.direccion ?? "",
  activo: c.activo === 1 || c.activo === true,

  // --------------------------
  // CAMPOS FUTUROS (NO EXISTEN AÚN EN EL BACKEND)
  // Cuando los agregues en la tabla/DTO, solo mapea aquí.
  // --------------------------
  // tipo: c.tipo ?? "INDIVIDUO",
  // empresa: c.empresa ?? "",
  // correo: c.email ?? c.correo ?? "",
  // telefono: c.telefono ?? "",
  // foto_url: c.foto_url ?? "",
  // --------------------------
});

export default function ClienteForm() {
  const { id } = useParams(); // "new" | id numérico
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nit: "",
    nombre: "",
    direccion: "",
    activo: true,

    // --------------------------
    // CAMPOS FUTUROS (NO EXISTEN AÚN EN EL BACKEND)
    // Los dejamos en el form/UI pero NO se envían al API actual.
    // --------------------------
    tipo: "INDIVIDUO", // FUTURO: INDIVIDUO | EMPRESA
    empresa: "",       // FUTURO
    correo: "",        // FUTURO
    telefono: "",      // FUTURO
    foto_url: "",      // FUTURO
    // --------------------------
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cargar si es edición
  useEffect(() => {
    let alive = true;
    if (isNew) return;

    setLoading(true);
    setError("");

    getCliente(id)
      .then((raw) => {
        if (!alive) return;
        const c = mapClienteFromApi(raw);

        setForm((prev) => ({
          ...prev, // mantiene los campos FUTUROS sin romper UI

          // Campos que existen en Deportes API
          nit: safe(c.nit),
          nombre: safe(c.nombre),
          direccion: safe(c.direccion, ""),
          activo: Boolean(c.activo),

          // --------------------------
          // CAMPOS FUTUROS (NO EXISTEN AÚN EN EL BACKEND)
          // Si en el futuro vienen del API, descomenta y mapea.
          // --------------------------
          // tipo: safe(c.tipo, "INDIVIDUO"),
          // empresa: safe(c.empresa, ""),
          // correo: safe(c.correo ?? c.email, ""),
          // telefono: safe(c.telefono, ""),
          // foto_url: safe(c.foto_url, ""),
          // --------------------------
        }));
      })
      .catch((e) => setError(e?.message || "No se pudo cargar el cliente."))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [id, isNew]);

  // FUTURO: solo aplica cuando exista tipo/empresa en backend
  const empresaDisabled = useMemo(() => form.tipo !== "EMPRESA", [form.tipo]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onCancel = () => navigate(-1);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      /**
       * Payload adaptado a ClienteDTO de Deportes API:
       * - POST /clientes acepta DTO parcial sin timestamps.
       * - PUT /clientes/{id} espera ClienteDTO (incluye id_cliente).
       */
      const payload = {
        id_cliente: isNew ? 0 : Number(id),
        nit: form.nit || "",
        nombre: form.nombre || "",
        direccion: form.direccion || null,
        activo: form.activo ? 1 : 0,

        // --------------------------
        // CAMPOS FUTUROS (NO EXISTEN AÚN EN EL BACKEND) → NO ENVIAR HOY
        // Cuando los agregues en la API, descomenta:
        // --------------------------
        // tipo: form.tipo,
        // empresa: form.empresa || null,
        // correo: form.correo || null,
        // telefono: form.telefono || null,
        // foto_url: form.foto_url || null,
        // --------------------------
      };

      await upsertCliente(isNew ? null : id, payload);
      navigate("/clientes");
    } catch (e) {
      setError(e?.message || "No se pudo guardar el cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || loading}
            className="h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 px-4 text-sm text-white hover:opacity-95 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
        <div />
      </div>

      {/* Mensajes */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error}
        </div>
      )}

      {/* Formulario */}
      {loading ? (
        <FormSkeleton />
      ) : (
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna izquierda */}
          <section className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-900 mb-3">Foto</p>

              {/* FUTURO: foto_url aún no existe en API */}
              <div className="flex items-center gap-3">
                <div className="h-32 w-32 overflow-hidden rounded-md bg-slate-100">
                  {form.foto_url ? (
                    <img
                      src={form.foto_url}
                      alt={form.nombre || "Foto"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.style.background = "#e5e7eb";
                      }}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-slate-400 text-xs">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">URL de la foto</label>
                  <input
                    name="foto_url"
                    value={form.foto_url}
                    onChange={onChange}
                    placeholder="https://…"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-700">Activo</span>
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={!!form.activo}
                    onChange={onChange}
                    className="peer sr-only"
                  />
                  <span className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-blue-500 relative transition-colors">
                    <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Columna derecha */}
          <section className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* NIT */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">NIT</label>
                  <input
                    name="nit"
                    value={form.nit}
                    onChange={onChange}
                    placeholder="1234567-8"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={onChange}
                    placeholder="Nombre completo o razón social"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Tipo (FUTURO) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Tipo</label>
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={onChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="INDIVIDUO">INDIVIDUO</option>
                    <option value="EMPRESA">EMPRESA</option>
                  </select>
                </div>

                {/* Empresa (FUTURO) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Empresa</label>
                  <input
                    name="empresa"
                    value={form.empresa}
                    onChange={onChange}
                    placeholder="Nombre de la empresa"
                    disabled={empresaDisabled}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 ${
                      empresaDisabled ? "border-slate-100 text-slate-400" : "border-slate-200"
                    }`}
                  />
                </div>

                {/* Correo (FUTURO) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Correo</label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={onChange}
                    placeholder="correo@dominio.com"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Teléfono (FUTURO) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Teléfono</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={onChange}
                    placeholder="+502 5555-0000"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Dirección</label>
                  <textarea
                    name="direccion"
                    value={form.direccion}
                    onChange={onChange}
                    rows={3}
                    placeholder="Calle, número, municipio, departamento…"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>
        </form>
      )}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-5 w-24 rounded bg-slate-100 mb-3" />
        <div className="flex items-center gap-3">
          <div className="h-32 w-32 rounded-md bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-9 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-5 w-16 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={i === 6 ? "md:col-span-2" : ""}>
              <div className="h-4 w-24 rounded bg-slate-100 mb-2" />
              <div className="h-9 w-full rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
