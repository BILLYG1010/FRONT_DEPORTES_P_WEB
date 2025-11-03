// src/models/cliente.js
// Lógica de MODELO: normalizadores, helpers y mapeo del DTO -> objeto de UI.

import { ENV } from "../config/env";

/** Convierte a URL absoluta si viene relativa */
function abs(u) {
  if (!u) return null;
  try {
    return new URL(u, ENV.BASE_URL).toString();
  } catch {
    return u;
  }
}

/** Normaliza booleanos que pueden venir como 0/1, "0"/"1", true/false o Buffer (MySQL BIT) */
export function toBool(v) {
  if (v == null) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v === "1" || v.toLowerCase() === "true";
  // MySQL BIT con mysql2 puede venir como Buffer <01> / <00>
  if (v && typeof v === "object" && typeof v.length === "number") {
    try {
      return Boolean(v[0]);
    } catch {
      return false;
    }
  }
  return Boolean(v);
}

/** Normaliza el campo tipo que podría venir como ENUM, 0/1, "0"/"1", boolean o Buffer */
export function normalizeTipo(v) {
  if (typeof v === "string") {
    const s = v.trim().toUpperCase();
    if (s === "EMPRESA" || s === "INDIVIDUO") return s;
    return "INDIVIDUO";
  }
  return toBool(v) ? "EMPRESA" : "INDIVIDUO";
}

/**
 * Mapea un DTO del backend a un objeto de UI
 * @returns {{
 *  id:number, nit:string, nombre:string, direccion:string|null,
 *  email:string|null, telefono:string|null,
 *  tipo:"INDIVIDUO"|"EMPRESA",
 *  avatar:string|null, foto_url:string|null,
 *  activo:boolean, status:"Activo"|"Inactivo",
 *  createdAt:string|null, updatedAt:string|null
 * }}
 */
export function mapClienteDto(dto = {}) {
  const foto = abs(dto.foto_url ?? null);
  const activo = toBool(dto.activo);

  return {
    id: Number(dto.id_cliente),
    nit: dto.nit ?? "",
    nombre: dto.nombre ?? "",
    direccion: dto.direccion ?? null,
    email: dto.correo ?? null,
    telefono: dto.telefono ?? null,

    // Robustez ante ENUM/boolean/bit/buffer
    tipo: normalizeTipo(dto.tipo),

    // UI usa foto_url; avatar se deja por compatibilidad
    avatar: foto,
    foto_url: foto,

    activo,
    status: activo ? "Activo" : "Inactivo",

    createdAt: dto.creado_en ?? null,
    updatedAt: dto.actualizado_en ?? null,
  };
}
