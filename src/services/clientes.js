// src/services/clientes.js
import { http } from "../lib/http";
import { ENV } from "../config/env";

const ENDPOINT = "/clientes";

// Convierte a URL absoluta si viene relativa
function abs(u) {
  if (!u) return null;
  try {
    // Si ya es absoluta, new URL(u) no fallará; si es relativa, la resuelve con BASE_URL
    return new URL(u, ENV.BASE_URL).toString();
  } catch {
    // En caso muy raro, devuelve lo que venga
    return u;
  }
}

/** @returns {{
 *  id:number,nit:string,nombre:string,direccion:string,
 *  email:string,telefono:string,tipo:"INDIVIDUO"|"EMPRESA",
 *  empresa:string|null, avatar:string|null, foto_url:string|null,
 *  activo:boolean, status:"Activo"|"Inactivo",
 *  createdAt:string|null, updatedAt:string|null
 * }} */
export function mapClienteDto(dto = {}) {
  const foto = abs(dto.foto_url ?? null);
  return {
    id: Number(dto.id_cliente),
    nit: dto.nit ?? "",
    nombre: dto.nombre ?? "",
    direccion: dto.direccion ?? "",
    email: dto.correo ?? "",
    telefono: dto.telefono ?? "",
    tipo: dto.tipo === "EMPRESA" ? "EMPRESA" : "INDIVIDUO",
    empresa: dto.empresa ?? null,
    avatar: foto,        // ← usa esto en tus componentes
    foto_url: foto,      // ← compatibilidad si ya usabas c.foto_url
    activo: Boolean(dto.activo),
    status: dto.activo ? "Activo" : "Inactivo",
    createdAt: dto.creado_en ?? null,
    updatedAt: dto.actualizado_en ?? null,
  };
}

export async function getClientes(opts = {}) {
  const params = {};
  if (opts.search) params.q = opts.search;
  if (typeof opts.activo === "boolean") params.activo = String(opts.activo);
  if (opts.tipo) params.tipo = opts.tipo;
  if (typeof opts.page === "number") params.page = String(opts.page);
  if (typeof opts.pageSize === "number") params.page_size = String(opts.pageSize);

  const data = await http.get(ENDPOINT, { params });
  const arr = Array.isArray(data) ? data : data?.data || [];
  return arr.map(mapClienteDto);
}

export function findClienteIn(cache, id) {
  return Array.isArray(cache) ? cache.find((c) => c.id === Number(id)) : undefined;
}

export default { getClientes, mapClienteDto, findClienteIn };
