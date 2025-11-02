import { ENV } from "../config/env";

function buildUrl(path, params) {
  const url = new URL(path.replace(/^\//, ""), ENV.BASE_URL.replace(/\/$/, "") + "/");
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.append(k, String(v)));
  }
  return url.toString();
}

function withTimeout(ms, signal) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(new DOMException("Timeout", "AbortError")), ms);
  const anySignal = signal ? anySignalMerge([ctrl.signal, signal]) : ctrl.signal;
  return { controller: ctrl, signal: anySignal, cancel: () => clearTimeout(id) };
}

// Merge simple de señales
function anySignalMerge(signals) {
  const controller = new AbortController();
  const onAbort = (e) => controller.abort(e);
  signals.forEach((s) => s?.addEventListener("abort", onAbort, { once: true }));
  return controller.signal;
}

async function request(method, path, { params, body, headers, signal } = {}) {
  const url = buildUrl(path, params);
  const { signal: timeoutSignal, cancel } = withTimeout(ENV.TIMEOUT, signal);

  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  if (ENV.API_KEY) defaultHeaders["x-api-key"] = ENV.API_KEY;

  // Si manejas auth por token:
  const token = localStorage.getItem("token"); // opcional
  if (token) defaultHeaders.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      method,
      headers: { ...defaultHeaders, ...(headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: timeoutSignal,
      credentials: "include", // si usas cookies en .NET
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || res.statusText;
      throw Object.assign(new Error(msg), { status: res.status, data });
    }
    return data;
  } finally {
    cancel();
  }
}

export const http = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, body, opts={}) => request("POST", path, { ...opts, body }),
  put: (path, body, opts={}) => request("PUT", path, { ...opts, body }),
  del: (path, opts) => request("DELETE", path, opts),
};
