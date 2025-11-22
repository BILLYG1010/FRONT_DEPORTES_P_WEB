// src/services/clientes.js
const BASE = import.meta.env.VITE_API_BASE_URL;

async function http(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.message || JSON.stringify(data) || msg;
    } catch { /* empty */ }
    throw new Error(msg);
  }

  // 204 no content
  if (res.status === 204) return null;
  return res.json();
}

const mapClienteFromApi = (c = {}) => ({
  id: c.id_cliente ?? c.id ?? null,
  nit: c.nit ?? "",
  nombre: c.nombre ?? "",
  direccion: c.direccion ?? "",
  activo: c.activo === 1 || c.activo === true,

  // FUTURO (cuando existan en API)
  email: c.email ?? null,
  telefono: c.telefono ?? null,
  tipo: c.tipo ?? null,
  foto_url: c.foto_url ?? null,
  empresa: c.empresa ?? null,
});

export async function getClientes() {
  const arr = await http(`${BASE}/clientes`);
  return { items: Array.isArray(arr) ? arr.map(mapClienteFromApi) : [] };
}

export async function getCliente(id) {
  const c = await http(`${BASE}/clientes/${id}`);
  return mapClienteFromApi(c);
}

/**
 * upsertCliente:
 * - nuevo => POST /clientes  (SIN id_cliente)
 * - editar => PUT /clientes/{id}
 */
export async function upsertCliente(id, payload) {
  if (!id) {
    // CREATE
    const body = {
      nit: payload.nit,
      nombre: payload.nombre,
      direccion: payload.direccion ?? null,
      activo: payload.activo ?? 1,
      // NO mandar id_cliente ni campos futuros aún
    };
    return http(`${BASE}/clientes`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // UPDATE
  const body = {
    id_cliente: Number(id),
    nit: payload.nit,
    nombre: payload.nombre,
    direccion: payload.direccion ?? null,
    activo: payload.activo ?? 1,
  };

  return http(`${BASE}/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteCliente(id) {
  return http(`${BASE}/clientes/${id}`, { method: "DELETE" });
}
