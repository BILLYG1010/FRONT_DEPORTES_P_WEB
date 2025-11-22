// src/pages/FacturasViews/FacturasForm.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getFactura, upsertFactura } from "../../services/facturas";
import { getClientes } from "../../services/clientes";
import { getProductos } from "../../services/inventario";

// ✅ PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const safe = (v, fb = "") => (v == null ? fb : v);

const fmtQ = (n) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const genTempAutorizacion = () =>
  `TEMP-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

const isTempAut = (aut) => String(aut || "").startsWith("TEMP-");

const estadoLabel = (estado, certificada) => {
  if (estado === 2) return "Anulada";
  if (certificada) return "Certificada";
  return "No certificada";
};
const estadoPillClass = (estado, certificada) => {
  if (estado === 2) return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  if (certificada) return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
};

// ================================
//  Combobox simple con buscador
// ================================
function Combobox({
  valueId,
  options = [],
  onSelect,
  placeholder = "Seleccionar...",
  getLabel = (o) => o?.label ?? "",
  renderOption,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(o.id) === String(valueId)) || null,
    [options, valueId]
  );

  useEffect(() => {
    if (selected) setQ(getLabel(selected));
  }, [selected, getLabel]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => getLabel(o).toLowerCase().includes(term));
  }, [q, options, getLabel]);

  return (
    <div
      ref={boxRef}
      className={`relative ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="max-h-56 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">
                Sin resultados
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onSelect?.(o);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {renderOption ? renderOption(o) : getLabel(o)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ================================
//  QR inventado (SVG simple)
// ================================
function FakeQR({ size = 160 }) {
  const cells = 21;
  const cellSize = size / cells;

  const black = (r, c) => {
    const inFinder =
      (r < 7 && c < 7) ||
      (r < 7 && c >= cells - 7) ||
      (r >= cells - 7 && c < 7);

    if (inFinder) {
      const rr = r % 7,
        cc = c % 7;
      if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true;
      if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    }

    return ((r * 17 + c * 13 + 7) % 5) === 0;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-md bg-white ring-1 ring-slate-200"
    >
      {Array.from({ length: cells }).map((_, r) =>
        Array.from({ length: cells }).map((__, c) =>
          black(r, c) ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function FacturasForm() {
  const { id } = useParams(); // "new" | id numérico
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [tab, setTab] = useState("lineas"); // "lineas" | "fel"
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [form, setForm] = useState({
    id_cliente_emisor: 1,
    id_cliente_receptor: "",
    id_usuario: 1,

    serie: "A",
    correlativo: "",

    estado: 0,
    observaciones: "",

    subtotal: 0,
    total: 0,

    uuid: null,
    fecha_emision: null,

    numero_autorizacion: genTempAutorizacion(), // ✅ siempre enviar algo
    fecha_certificacion: null,
    codigo_certificacion: null,
  });

  const [lines, setLines] = useState([]);
  const [removedLineIds, setRemovedLineIds] = useState([]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [certificando, setCertificando] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------
  // Helpers líneas
  // ----------------------------
  const calcLineSubtotal = useCallback((l) => {
    const qty = Number(l.cantidad || 0);
    const price = Number(l.precio_unitario || 0);
    const disc = Number(l.descuento || 0);
    return Math.max(0, qty * price - disc);
  }, []);

  const recalcTotals = useCallback(
    (nextLines) => {
      const st = nextLines.reduce((acc, l) => acc + calcLineSubtotal(l), 0);
      const val = Number(st.toFixed(2));
      setForm((f) => ({ ...f, subtotal: val, total: val }));
    },
    [calcLineSubtotal]
  );

  const addLine = useCallback(() => {
    const newLine = {
      tempId: crypto.randomUUID(),
      id_detalle: null,
      id_producto: "",
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0,
      subtotal: 0,
    };
    setLines((prev) => {
      const next = [...prev, newLine];
      recalcTotals(next);
      return next;
    });
  }, [recalcTotals]);

  const removeLine = useCallback(
    (line) => {
      setLines((prev) => {
        const next = prev.filter((l) => l.tempId !== line.tempId);
        recalcTotals(next);
        return next;
      });
      if (line.id_detalle) {
        setRemovedLineIds((r) => [...r, line.id_detalle]);
      }
    },
    [recalcTotals]
  );

  const updateLine = useCallback(
    (tempId, patch) => {
      setLines((prev) => {
        const next = prev.map((l) => {
          if (l.tempId !== tempId) return l;
          const updated = { ...l, ...patch };
          updated.subtotal = calcLineSubtotal(updated);
          return updated;
        });
        recalcTotals(next);
        return next;
      });
    },
    [calcLineSubtotal, recalcTotals]
  );

  // ----------------------------
  // Cargar catálogos
  // ----------------------------
  useEffect(() => {
    let alive = true;
    Promise.all([getClientes(), getProductos()])
      .then(([cRes, pRes]) => {
        if (!alive) return;
        setClientes(Array.isArray(cRes.items) ? cRes.items : []);
        setProductos(Array.isArray(pRes.items) ? pRes.items : []);
      })
      .catch(() => {});
    return () => (alive = false);
  }, []);

  // ----------------------------
  // Detalles factura (fetch directo)
  // ----------------------------
  async function fetchDetallesFactura(idFactura) {
    const res = await fetch(
      `${API_BASE}/detalles-factura/factura/${idFactura}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return [];
    const arr = await res.json();
    if (!Array.isArray(arr)) return [];
    return arr.map((d) => ({
      tempId: crypto.randomUUID(),
      id_detalle: d.id_detalle,
      id_factura: d.id_factura,
      id_producto: d.id_producto ?? "",
      descripcion: d.descripcion ?? "",
      cantidad: d.cantidad ?? 1,
      precio_unitario: d.precio_unitario ?? 0,
      descuento: d.descuento ?? 0,
      subtotal: d.subtotal ?? 0,
    }));
  }

  async function postDetalleFactura(idFactura, line) {
    const body = {
      id_factura: Number(idFactura),
      id_producto: line.id_producto ? Number(line.id_producto) : null,
      descripcion: line.descripcion || "",
      cantidad: Number(line.cantidad) || 0,
      precio_unitario: Number(line.precio_unitario) || 0,
      descuento: Number(line.descuento) || 0,
      subtotal: Number(calcLineSubtotal(line)) || 0,
    };
    const res = await fetch(`${API_BASE}/detalles-factura`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.title || data?.message || "Error creando detalle");
    }
    return res.json();
  }

  async function putDetalleFactura(idDetalle, line) {
    const body = {
      id_detalle: Number(idDetalle),
      id_factura: Number(line.id_factura),
      id_producto: line.id_producto ? Number(line.id_producto) : null,
      descripcion: line.descripcion || "",
      cantidad: Number(line.cantidad) || 0,
      precio_unitario: Number(line.precio_unitario) || 0,
      descuento: Number(line.descuento) || 0,
      subtotal: Number(calcLineSubtotal(line)) || 0,
    };
    const res = await fetch(`${API_BASE}/detalles-factura/${idDetalle}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(
        data?.title || data?.message || "Error actualizando detalle"
      );
    }
    return res.json();
  }

  async function deleteDetalleFactura(idDetalle) {
    const res = await fetch(`${API_BASE}/detalles-factura/${idDetalle}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => null);
      throw new Error(
        data?.title || data?.message || "Error eliminando detalle"
      );
    }
  }

  // ----------------------------
  // Cargar factura si es edición
  // ----------------------------
  useEffect(() => {
    let alive = true;

    if (isNew) {
      setLoading(false);
      setLines([]);
      setRemovedLineIds([]);
      setTab("lineas");
      setForm((f) => ({
        ...f,
        id_cliente_receptor: "",
        observaciones: "",
        estado: 0,
        subtotal: 0,
        total: 0,
        uuid: null,
        fecha_emision: null,
        fecha_certificacion: null,
        codigo_certificacion: null,
        numero_autorizacion: genTempAutorizacion(),
      }));
      return;
    }

    setLoading(true);
    setError("");

    (async () => {
      try {
        const f = await getFactura(id);
        if (!alive) return;

        const detalles = await fetchDetallesFactura(id);

        const yaCertificada =
          !!f.fecha_certificacion ||
          (Number(f.estado) === 1 && !isTempAut(f.numero_autorizacion));

        setForm((prev) => ({
          ...prev,
          id_cliente_emisor: safe(f.id_cliente_emisor, 1),
          id_cliente_receptor: safe(f.id_cliente_receptor, ""),
          id_usuario: safe(f.id_usuario, 1),

          serie: safe(f.serie, "A"),
          correlativo: safe(f.correlativo, ""),

          estado: safe(f.estado, yaCertificada ? 1 : 0),
          observaciones: safe(f.observaciones, ""),

          subtotal: safe(f.subtotal, 0),
          total: safe(f.total, 0),

          uuid: safe(f.uuid, null),
          fecha_emision: safe(f.fecha_emision, null),

          numero_autorizacion: safe(
            f.numero_autorizacion,
            genTempAutorizacion()
          ),
          fecha_certificacion: safe(f.fecha_certificacion, null),
          codigo_certificacion: safe(f.numero_autorizacion, null) || null,
        }));

        setLines(detalles);
        recalcTotals(detalles);

        if (yaCertificada) setTab("fel");
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "No se pudo cargar la factura.");
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => (alive = false);
  }, [id, isNew, recalcTotals]);

  const onHeaderChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const onCancel = () => navigate(-1);

  // ----------------------------
  // Guardar factura + detalles
  // ----------------------------
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.id_cliente_receptor) {
        throw new Error("Debes seleccionar un cliente.");
      }
      if (lines.length === 0) {
        throw new Error("Agrega al menos una línea de producto.");
      }
      for (const l of lines) {
        if (!l.descripcion?.trim()) {
          throw new Error("Cada línea requiere una descripción.");
        }
        if (!l.cantidad || Number(l.cantidad) <= 0) {
          throw new Error("La cantidad debe ser mayor a 0.");
        }
      }

      const numero_autorizacion_envio =
        (form.numero_autorizacion && String(form.numero_autorizacion).trim()) ||
        genTempAutorizacion();

      const payloadFactura = {
        id_cliente_emisor: 1,
        id_cliente_receptor: Number(form.id_cliente_receptor),
        id_usuario: 1,
        serie: "A",
        correlativo: null,
        estado: Number(form.estado) || 0,
        subtotal: Number(form.subtotal) || 0,
        total: Number(form.total) || 0,
        observaciones: form.observaciones || "",
        numero_autorizacion: numero_autorizacion_envio, // ✅ requerido por tu API
      };

      const resp = await upsertFactura(isNew ? null : id, payloadFactura);

      const facturaId =
        resp?.id_factura ?? resp?.id ?? (!isNew ? Number(id) : null);

      if (!facturaId) throw new Error("No se pudo obtener el ID de la factura.");

      for (const detId of removedLineIds) {
        await deleteDetalleFactura(detId);
      }

      for (const l of lines) {
        const linePayload = { ...l, id_factura: facturaId };
        if (l.id_detalle) {
          await putDetalleFactura(l.id_detalle, linePayload);
        } else {
          await postDetalleFactura(facturaId, linePayload);
        }
      }

      setRemovedLineIds([]);

      if (isNew) {
        navigate(`/facturas/${facturaId}`, { replace: true });
      }

      setForm((f) => ({ ...f, numero_autorizacion: numero_autorizacion_envio }));
    } catch (err) {
      setError(err?.message || "No se pudo guardar la factura.");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------
  // Certificar con delay simulado
  // ----------------------------
  const onCertificar = async () => {
    if (isNew) {
      setError("Primero guarda la factura antes de certificar.");
      return;
    }
    setCertificando(true);
    setError("");
    setTab("fel");

    setTimeout(async () => {
      const fakeCodigo = `FEL-${String(id).padStart(
        6,
        "0"
      )}-${Date.now().toString().slice(-4)}`;
      const fakeAut = `AUT-${Math.floor(Math.random() * 900000 + 100000)}`;
      const fechaCert = new Date().toISOString();

      setForm((f) => ({
        ...f,
        estado: 1,
        numero_autorizacion: fakeAut,
        fecha_certificacion: fechaCert,
        codigo_certificacion: fakeCodigo,
      }));

      try {
        await upsertFactura(id, {
          id_cliente_emisor: 1,
          id_cliente_receptor: Number(form.id_cliente_receptor),
          id_usuario: 1,
          serie: "A",
          correlativo: null,
          estado: 1,
          subtotal: Number(form.subtotal) || 0,
          total: Number(form.total) || 0,
          observaciones: form.observaciones || "",
          numero_autorizacion: fakeAut,
          fecha_certificacion: fechaCert,
        });
      } catch {
        // simulación OK
      } finally {
        setCertificando(false);
      }
    }, 1200);
  };

  // ✅ Certificada real solo si NO es TEMP
  const certificada =
    !!form.fecha_certificacion ||
    (Number(form.estado) === 1 && !isTempAut(form.numero_autorizacion));

  const clienteOptions = useMemo(
    () =>
      clientes.map((c) => ({
        id: c.id,
        label: `${c.nombre} — ${c.nit}`,
        raw: c,
      })),
    [clientes]
  );

  const productoOptions = useMemo(
    () =>
      productos.map((p) => ({
        id: p.id,
        label: `${p.nombre} (SKU: ${p.sku})`,
        raw: p,
      })),
    [productos]
  );

  const displayRef = useMemo(() => {
    const serie = form.serie || "A";
    const corr = form.correlativo || (!isNew ? id : null);
    if (!corr) return `${serie}-Borrador`;
    const corrStr = String(corr).padStart(6, "0");
    return `${serie}-${corrStr}`;
  }, [form.serie, form.correlativo, id, isNew]);

  // ======================================================
  // ✅ IMPRIMIR / PDF PROFESIONAL
  // ======================================================
  const onImprimir = () => {
    try {
      if (!form.id_cliente_receptor) {
        setError("Selecciona un cliente antes de imprimir.");
        return;
      }
      if (lines.length === 0) {
        setError("Agrega al menos una línea antes de imprimir.");
        return;
      }

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Deportes API — Factura", 40, 50);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Factura: ${displayRef}`, 40, 70);

      const fechaTxt =
        form.fecha_emision
          ? new Date(form.fecha_emision).toLocaleString()
          : new Date().toLocaleString();

      const clienteSel = clientes.find(
        (c) => String(c.id) === String(form.id_cliente_receptor)
      );
      const clienteNombre = clienteSel?.nombre || "—";
      const clienteNit = clienteSel?.nit || "—";
      const clienteDir = clienteSel?.direccion || "";

      // Info cliente
      doc.setFont("helvetica", "bold");
      doc.text("Cliente:", 40, 100);
      doc.setFont("helvetica", "normal");
      doc.text(clienteNombre, 100, 100);

      doc.setFont("helvetica", "bold");
      doc.text("NIT:", 40, 118);
      doc.setFont("helvetica", "normal");
      doc.text(clienteNit, 100, 118);

      if (clienteDir) {
        doc.setFont("helvetica", "bold");
        doc.text("Dirección:", 40, 136);
        doc.setFont("helvetica", "normal");
        doc.text(clienteDir, 100, 136, { maxWidth: pageW - 160 });
      }

      doc.setFont("helvetica", "bold");
      doc.text("Fecha:", pageW - 200, 100);
      doc.setFont("helvetica", "normal");
      doc.text(fechaTxt, pageW - 40, 100, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.text("Estado:", pageW - 200, 118);
      doc.setFont("helvetica", "normal");
      doc.text(estadoLabel(form.estado, certificada), pageW - 40, 118, {
        align: "right",
      });

      if (form.observaciones?.trim()) {
        doc.setFont("helvetica", "bold");
        doc.text("Observación:", 40, 160);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(String(form.observaciones), 40, 176, {
          maxWidth: pageW - 80,
        });
      }

      // Tabla líneas
      const body = lines.map((l, idx) => {
        const prod = productos.find((p) => String(p.id) === String(l.id_producto));
        const prodName = prod?.nombre || "—";
        const prodSku = prod?.sku ? `(${prod.sku})` : "";
        return [
          String(idx + 1),
          `${prodName} ${prodSku}`.trim(),
          l.descripcion || prodName,
          Number(l.cantidad || 0),
          fmtQ(l.precio_unitario || 0),
          fmtQ(l.descuento || 0),
          fmtQ(calcLineSubtotal(l)),
        ];
      });

      autoTable(doc, {
        startY: 210,
        head: [[
          "#",
          "Producto",
          "Descripción",
          "Cant.",
          "Precio U.",
          "Descuento",
          "Subtotal",
        ]],
        body,
        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 6,
          valign: "middle",
        },
        headStyles: {
          fillColor: [245, 246, 250],
          textColor: [20, 20, 20],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 25 },
          3: { halign: "right", cellWidth: 45 },
          4: { halign: "right", cellWidth: 75 },
          5: { halign: "right", cellWidth: 75 },
          6: { halign: "right", cellWidth: 80 },
        },
        margin: { left: 40, right: 40 },
      });

      const endY = doc.lastAutoTable?.finalY || 210;

      // Totales
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Subtotal:", pageW - 200, endY + 30);
      doc.text(fmtQ(form.subtotal), pageW - 40, endY + 30, { align: "right" });

      doc.text("Total:", pageW - 200, endY + 48);
      doc.text(fmtQ(form.total), pageW - 40, endY + 48, { align: "right" });

      // FEL si certificada
      if (certificada) {
        doc.setFont("helvetica", "bold");
        doc.text("Información FEL (demo):", 40, endY + 80);

        doc.setFont("helvetica", "normal");
        doc.text(`Código: ${form.codigo_certificacion || "—"}`, 40, endY + 98);
        doc.text(`Autorización: ${form.numero_autorizacion || "—"}`, 40, endY + 114);
        doc.text(
          `Fecha cert.: ${
            form.fecha_certificacion
              ? new Date(form.fecha_certificacion).toLocaleString()
              : "—"
          }`,
          40,
          endY + 130
        );
      }

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "Documento generado desde el sistema (demo).",
        40,
        pageH - 30
      );

      doc.save(`Factura_${displayRef}.pdf`);
    // eslint-disable-next-line no-unused-vars
    } catch (  e) {
      setError("No se pudo generar el PDF. Revisa que jspdf esté instalado.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top bar acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          <button
            type="button"
            onClick={onCertificar}
            disabled={loading || certificando}
            className="h-10 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            {certificando ? "Certificando…" : "Certificar"}
          </button>

          {/* ✅ IMPRIMIR */}
          <button
            type="button"
            onClick={onImprimir}
            disabled={loading}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            Imprimir
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-900">
            Factura: {displayRef}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs ${estadoPillClass(
              form.estado,
              certificada
            )}`}
          >
            {estadoLabel(form.estado, certificada)}
          </span>

          {!isNew && form.uuid && (
            <span className="text-xs text-slate-500">UUID: {form.uuid}</span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <FormSkeleton />
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Header Odoo-like */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Cliente receptor */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Cliente
                </label>
                <Combobox
                  valueId={form.id_cliente_receptor}
                  options={clienteOptions}
                  placeholder="Buscar cliente..."
                  getLabel={(o) => o.label}
                  renderOption={(o) => (
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {o.raw.nombre}
                      </span>
                      <span className="text-xs text-slate-500">
                        NIT: {o.raw.nit}
                      </span>
                    </div>
                  )}
                  onSelect={(o) =>
                    setForm((f) => ({ ...f, id_cliente_receptor: o.id }))
                  }
                />
              </div>

              {/* Fecha automática */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Fecha
                </label>
                <input
                  disabled
                  value={
                    form.fecha_emision
                      ? new Date(form.fecha_emision).toLocaleString()
                      : new Date().toLocaleString()
                  }
                  className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm text-slate-500"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Fecha automática
                </p>
              </div>

              {/* Observación */}
              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Observación
                </label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={onHeaderChange}
                  rows={2}
                  placeholder="Venta mostrador, crédito, etc…"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tabs estilo Odoo */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-1 border-b border-slate-100 px-3">
              <button
                type="button"
                onClick={() => setTab("lineas")}
                className={[
                  "px-4 py-2 text-sm border-b-2 -mb-px",
                  tab === "lineas"
                    ? "border-blue-500 text-blue-700 font-semibold"
                    : "border-transparent text-slate-600 hover:text-slate-900",
                ].join(" ")}
              >
                Líneas de productos
              </button>
              <button
                type="button"
                onClick={() => setTab("fel")}
                className={[
                  "px-4 py-2 text-sm border-b-2 -mb-px",
                  tab === "fel"
                    ? "border-blue-500 text-blue-700 font-semibold"
                    : "border-transparent text-slate-600 hover:text-slate-900",
                ].join(" ")}
              >
                Información FEL
              </button>
            </div>

            {/* TAB 1: Líneas */}
            {tab === "lineas" && (
              <div className="p-0">
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Detalle de factura
                  </p>
                  <button
                    type="button"
                    onClick={addLine}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Agregar línea
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] table-auto">
                    <thead className="bg-slate-50">
                      <tr>
                        <Th className="w-[34%]">Producto</Th>
                        <Th>Descripción</Th>
                        <Th className="w-[8%]">Cantidad</Th>
                        <Th className="w-[10%]">Precio U.</Th>
                        <Th className="w-[10%]">Descuento</Th>
                        <Th className="w-[12%]">Subtotal</Th>
                        <Th className="w-[6%] text-center"> </Th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-sm text-slate-500"
                          >
                            Agrega productos para empezar.
                          </td>
                        </tr>
                      ) : (
                        lines.map((l) => (
                          <tr
                            key={l.tempId}
                            className="border-b border-slate-100 align-top"
                          >
                            <Td>
                              <Combobox
                                valueId={l.id_producto}
                                options={productoOptions}
                                placeholder="Buscar producto..."
                                getLabel={(o) => o.label}
                                renderOption={(o) => (
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">
                                      {o.raw.nombre}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      SKU: {o.raw.sku}
                                    </span>
                                  </div>
                                )}
                                onSelect={(o) => {
                                  updateLine(l.tempId, {
                                    id_producto: o.id,
                                    descripcion: l.descripcion?.trim()
                                      ? l.descripcion
                                      : o.raw.nombre,
                                    precio_unitario: Number(o.raw.precio) || 0,
                                  });
                                }}
                              />
                            </Td>

                            <Td>
                              <input
                                value={l.descripcion}
                                onChange={(e) =>
                                  updateLine(l.tempId, {
                                    descripcion: e.target.value,
                                  })
                                }
                                placeholder="Descripción"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                                required
                              />
                            </Td>

                            <Td>
                              <input
                                type="number"
                                min="1"
                                value={l.cantidad}
                                onChange={(e) =>
                                  updateLine(l.tempId, {
                                    cantidad: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500"
                              />
                            </Td>

                            <Td>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={l.precio_unitario}
                                onChange={(e) =>
                                  updateLine(l.tempId, {
                                    precio_unitario: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500"
                              />
                            </Td>

                            <Td>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={l.descuento}
                                onChange={(e) =>
                                  updateLine(l.tempId, {
                                    descuento: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500"
                              />
                            </Td>

                            <Td>
                              <input
                                disabled
                                value={fmtQ(calcLineSubtotal(l))}
                                className="w-full rounded-lg border border-slate-100 bg-white px-2 py-2 text-sm text-slate-500"
                              />
                            </Td>

                            <Td className="text-center">
                              <button
                                type="button"
                                onClick={() => removeLine(l)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                                title="Eliminar línea"
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M9 3h6l1 2h5v2H3V5h5l1-2zM5 9h14l-1 11a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z" />
                                </svg>
                              </button>
                            </Td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totales al final */}
                <div className="flex justify-end px-4 py-4">
                  <div className="w-full max-w-sm rounded-lg bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        {fmtQ(form.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Total</span>
                      <span className="font-semibold text-slate-900">
                        {fmtQ(form.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FEL */}
            {tab === "fel" && (
              <div className="p-4">
                {!certificada && !certificando ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-6" />
                ) : certificando ? (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
                    Certificando factura…
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Código certificación
                        </label>
                        <input
                          disabled
                          value={form.codigo_certificacion || ""}
                          className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          No. Autorización
                        </label>
                        <input
                          disabled
                          value={form.numero_autorizacion || ""}
                          className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Fecha certificación
                        </label>
                        <input
                          disabled
                          value={
                            form.fecha_certificacion
                              ? new Date(form.fecha_certificacion).toLocaleString()
                              : ""
                          }
                          className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2">
                      <FakeQR />
                      <p className="text-xs text-slate-500">
                        QR para validar factura (demo)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

// =========================
// Skeleton
// =========================
function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 rounded bg-slate-100 animate-pulse mb-2" />
              <div className="h-9 w-full rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
          <div className="md:col-span-3">
            <div className="h-3 w-24 rounded bg-slate-100 animate-pulse mb-2" />
            <div className="h-16 w-full rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================
// Helpers tabla
// =========================
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
