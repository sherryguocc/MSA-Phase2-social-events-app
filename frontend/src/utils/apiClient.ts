// Use environment variable for API base URL, fallback to empty for local proxy
const baseUrl = import.meta.env.VITE_API_BASE || "";

export async function apiGet(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  console.log("🔍 apiGet request to:", path);
  console.log("🔑 token:", token);

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  console.log("📦 response status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Fetch error:", text);
    throw new Error("API Error");
  }

  return res.json();
}


export async function apiPost(path: string, data: any, options: RequestInit = {}) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, {
    method: "POST",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: JSON.stringify(data),
  });
  // Handle response data parsing
  const responseData = await res.json().catch(() => ({}));

  if (!res.ok){
    throw new Error(responseData.message ||"API Error");
  }
  return responseData;
}


export async function apiPut(path: string, data: any, options: RequestInit = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "PUT",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("PUT request failed");
  return res.json();
}


export async function apiDelete(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const fullUrl = `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  console.log("🧨 DELETE request to:", fullUrl);

  const res = await fetch(fullUrl, {
    ...options,
    method: "DELETE",
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Delete error:", res.status, text);
    throw new Error(text || "API Error");
  }

  return res.json().catch(() => ({})); // in case backend returns empty
}
