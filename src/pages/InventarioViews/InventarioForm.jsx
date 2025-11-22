// src/pages/InventarioViews/ProductoForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProducto, upsertProducto } from "../../services/inventario";

const safe = (v, fb = "") => (v == null ? fb : v);

export default function ProductoForm() {
  const { id } = useParams(); // "new" | id numérico
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sku: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    activo: true,

    // ===== FUTURO (no existe en API aún) =====
    categoria: "",
    imagen_url: "",
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

    getProducto(id)
      .then((p) => {
        if (!alive) return;
        setForm({
          sku: safe(p.sku),
          nombre: safe(p.nombre),
          descripcion: safe(p.descripcion),
          precio: safe(p.precio, ""),
          stock: safe(p.stock, ""),
          activo: Boolean(p.activo),

          // FUTURO
          categoria: safe(p.categoria, ""),
          imagen_url: safe(p.imagen_url, ""),
        });
      })
      .catch((e) => setError(e?.message || "No se pudo cargar el producto."))
      .finally(() => alive && setLoading(false));

    return () => (alive = false);
  }, [id, isNew]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onCancel = () => navigate(-1);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const skuClean = (form.sku || "").trim();
      const nombreClean = (form.nombre || "").trim();

      // ✅ validación fuerte ANTES de pegar al API
      if (!skuClean) throw new Error("El SKU es obligatorio.");
      if (!nombreClean) throw new Error("El nombre es obligatorio.");

      const payload = {
        sku: skuClean,
        nombre: nombreClean,
        descripcion: form.descripcion?.trim() || null,
        precio_unitario: form.precio === "" ? 0 : Number(form.precio),
        cantidad: form.stock === "" ? 0 : Number(form.stock),
        activo: !!form.activo,

        // ===== FUTURO (NO ENVIAR AÚN) =====
        // categoria: form.categoria || null,
        // imagen_url: form.imagen_url || null,
      };

      await upsertProducto(isNew ? null : id, payload);
      navigate("/inventario");
    } catch (e2) {
      setError(e2?.message || "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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
          {/* Barra superior: botones IZQUIERDA (ahora submit real) */}
          <div className="lg:col-span-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="submit"
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

          {/* Columna izquierda: “imagen futura” + estado */}
          <section className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-900 mb-3">Imagen (futuro)</p>

              <div className="flex items-center gap-3">
                <div className="h-32 w-32 overflow-hidden rounded-md bg-slate-100">
                  {form.imagen_url ? (
                    <img
                      src={form.imagen_url}
                      alt={form.nombre || "Imagen"}
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
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    URL Imagen (futuro)
                  </label>
                  <input
                    name="imagen_url"
                    value={form.imagen_url}
                    onChange={onChange}
                    placeholder="https://…"
                    disabled
                    className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm outline-none text-slate-400"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Campo aún no existe en el API.
                  </p>
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

          {/* Columna derecha: campos */}
          <section className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* SKU */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">SKU</label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={onChange}
                    placeholder="SKU-001"
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
                    placeholder="Nombre del producto"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Precio unitario</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={form.precio}
                    onChange={onChange}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={onChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Categoría FUTURA */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Categoría (futuro)</label>
                  <input
                    name="categoria"
                    value={form.categoria}
                    onChange={onChange}
                    placeholder="Accesorios, Ropa…"
                    disabled
                    className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm outline-none text-slate-400"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Campo aún no existe en el API.
                  </p>
                </div>

                {/* Descripción (span 2) */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={onChange}
                    rows={3}
                    placeholder="Descripción del producto…"
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
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={i === 5 ? "md:col-span-2" : ""}>
              <div className="h-4 w-24 rounded bg-slate-100 mb-2" />
              <div className="h-9 w-full rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
