// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import CardStat from "../components/CardStat";
import ProjectTable from "../components/ProjectTable";

import { getClientes } from "../services/clientes";
import { getProductos } from "../services/inventario";
import { getFacturas } from "../services/facturas";

const fmtQ = (n) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    Promise.all([getClientes(), getProductos(), getFacturas()])
      .then(([cRes, pRes, fRes]) => {
        if (!alive) return;
        setClientes(Array.isArray(cRes.items) ? cRes.items : []);
        setProductos(Array.isArray(pRes.items) ? pRes.items : []);
        setFacturas(Array.isArray(fRes.items) ? fRes.items : []);
      })
      .catch(() => {
        if (!alive) return;
        setClientes([]);
        setProductos([]);
        setFacturas([]);
      })
      .finally(() => alive && setLoading(false));

    return () => (alive = false);
  }, []);

  // ==========================
  // MÉTRICAS REALES (MINIMAL)
  // ==========================
  const stats = useMemo(() => {
    const clientesActivos = clientes.filter((c) => c.activo !== false && c.activo !== 0);
    const productosActivos = productos.filter((p) => p.activo !== false && p.activo !== 0);

    const stockTotal = productosActivos.reduce(
      (acc, p) => acc + Number(p.cantidad || 0),
      0
    );

    const facturasActivas = facturas.filter((f) => !f.eliminado);
    const ventasTotales = facturasActivas
      .filter((f) => Number(f.estado) !== 2) // no sumar anuladas
      .reduce((acc, f) => acc + Number(f.total || 0), 0);

    return [
      {
        title: "Ventas totales",
        value: fmtQ(ventasTotales),
        delta: "",
        deltaColor: "text-slate-500",
        iconBg: "from-blue-600 to-blue-400",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            <path
              fillRule="evenodd"
              d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        title: "Facturas activas",
        value: String(facturasActivas.length),
        delta: "",
        deltaColor: "text-slate-500",
        iconBg: "from-orange-600 to-orange-400",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M6 2.25h9l3 3v14.25A2.25 2.25 0 0115.75 21H6A2.25 2.25 0 013.75 18.75V4.5A2.25 2.25 0 016 2.25zM15 2.5v3h3" />
          </svg>
        ),
      },
      {
        title: "Clientes activos",
        value: String(clientesActivos.length),
        delta: "",
        deltaColor: "text-slate-500",
        iconBg: "from-pink-600 to-pink-400",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.75 20.105a8.25 8.25 0 0116.5 0 .75.75 0 01-.437.695A18.68 18.68 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.438-.695z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        title: "Productos / Stock",
        value: `${productosActivos.length} / ${stockTotal}`,
        delta: "",
        deltaColor: "text-slate-500",
        iconBg: "from-green-600 to-green-400",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M3 7.5l9-4.5 9 4.5-9 4.5-9-4.5zm0 3.75l9 4.5 9-4.5V19.5l-9 4.5-9-4.5v-8.25z" />
          </svg>
        ),
      },
    ];
  }, [clientes, productos, facturas]);

  // ==========================
  // FACTURAS RECIENTES
  // ==========================
  const recentRows = useMemo(() => {
    const act = facturas.filter((f) => !f.eliminado);

    const sorted = [...act].sort((a, b) => {
      const da = toDate(a.fecha_emision) || toDate(a.creado_en) || new Date(0);
      const db = toDate(b.fecha_emision) || toDate(b.creado_en) || new Date(0);
      return db - da;
    });

    return sorted.slice(0, 8).map((f, idx) => {
      const serie = f.serie || "A";
      const corr = f.correlativo || f.id || f.id_factura || idx + 1;
      const ref = `${serie}-${String(corr).padStart(6, "0")}`;

      const cliente = clientes.find(
        (c) => String(c.id) === String(f.id_cliente_receptor)
      );

      const estado = Number(f.estado || 0);
      const certificada = estado === 1 && f.numero_autorizacion;

      let completion = 50;
      let completionColor = "from-blue-600 to-blue-400";
      if (estado === 2) {
        completion = 0;
        completionColor = "from-rose-600 to-rose-400";
      } else if (certificada) {
        completion = 100;
        completionColor = "from-green-600 to-green-400";
      }

      return {
        company: `${ref} — ${cliente?.nombre || "Cliente"}`,
        budget: fmtQ(f.total),
        completion,
        completionColor,
      };
    });
  }, [facturas, clientes]);

  return (
    <>
      {/* Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white shadow-md animate-pulse" />
            ))
          : stats.map((s, i) => <CardStat key={i} {...s} />)}
      </div>

      {/* Tabla */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="relative flex flex-col overflow-hidden rounded-xl bg-white text-slate-700 shadow-md xl:col-span-2">
          <div className="flex items-center justify-between p-6">
            <div>
              <h6 className="text-base font-semibold text-slate-900 mb-1">
                Facturas recientes
              </h6>
              <p className="text-sm text-slate-600">
                Últimas {recentRows.length} facturas registradas
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.assign("/facturas")}
              className="grid place-items-center h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-500/10"
              title="Ver todas"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
          </div>

          <ProjectTable rows={recentRows} />
        </div>
      </div>
    </>
  );
}
