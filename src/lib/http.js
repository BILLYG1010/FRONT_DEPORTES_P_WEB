// src/lib/http.js
import { ENV } from "../config/env";

/* -----------------------------
 * URL builder con query params
 * ----------------------------- */
function buildUrl(path, params) {
  const base = (ENV.BASE_URL || "").replace(/\/$/, "");
  const cleanPath = String(path || "").replace(/^\//, "");
  const url = new URL(`${base}/${cleanPath}`);

  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      if (v != null) url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

/* -----------------------------
 * Abort + timeout combinados
 * ----------------------------- */
function anySignalMerge(signals) {
  const controller = new AbortController();
  const onAbort = (e) => controller.abort(e);
  signals.forEach((s) => s?.addEventListener("abort", onAbort, { once: true }));
  return controller.signal;
}

function withTimeout(ms, externalSignal) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(new DOMException("Timeout", "AbortError")), Number(ms) || 20000);
  const merged = externalSignal ? anySignalMerge([ctrl.signal, externalSignal]) : ctrl.signal;
  return {
    signal: merged,
    cancel: () => clearTimeout(id),
  };
}

/* -----------------------------
 * Core request
 * ----------------------------- */
async function request(method, path, { params, body, headers, signal } = {}) {
  const url = buildUrl(path, params);
  const { signal: timeoutSignal, cancel } = withTimeout(ENV.TIMEOUT || 20000, signal);

  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  if (ENV.API_KEY) defaultHeaders["x-api-key"] = ENV.API_KEY;

  // Token opcional (si manejas JWT en localStorage)
  const token = localStorage.getItem("token");
  if (token) defaultHeaders.Authorization = `Bearer ${token}`;

  // Enviar cookies sólo si realmente las usas (tu API FastAPI ya permite credentials)
  const useCookies = ENV.SEND_COOKIES === true || String(ENV.SEND_COOKIES).toLowerCase() === "true";

  try {
    const res = await fetch(url, {
      method,
      headers: { ...defaultHeaders, ...(headers || {}) },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: timeoutSignal,
      credentials: useCookies ? "include" : "same-origin",
    });

    // 204/205: sin cuerpo
    if (res.status === 204 || res.status === 205) {
      if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status });
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json") || contentType.includes("problem+json");

    let data;
    try {
      data = isJson ? await res.json() : await res.text();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg =
        (isJson && data && (data.detail || data.message || data.error)) ||
        (typeof data === "string" && data) ||
        res.statusText ||
        "HTTP error";
      throw Object.assign(new Error(msg), { status: res.status, data });
    }

    return data;
  } finally {
    cancel();
  }
}

/* -----------------------------
 * API pública
 * ----------------------------- */
export const http = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, body, opts = {}) => request("POST", path, { ...opts, body }),
  put: (path, body, opts = {}) => request("PUT", path, { ...opts, body }),
  patch: (path, body, opts = {}) => request("PATCH", path, { ...opts, body }),
  del: (path, opts) => request("DELETE", path, opts),
};

export default http;
