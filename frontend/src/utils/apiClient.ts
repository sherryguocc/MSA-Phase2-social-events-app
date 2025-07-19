// Use environment variable for API base URL, fallback to empty for local proxy
const baseUrl = import.meta.env.VITE_API_BASE || "";

export async function apiGet(path: string, options: RequestInit = {}) {
  const res = await fetch(`${baseUrl}${path}`, options);
  if (!res.ok) throw new Error("API Error");
  return res.json();
}

export async function apiPost(path: string, data: any, options: RequestInit = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
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
  const res = await fetch(`${baseUrl}${path}`, {
    method: "DELETE",
    ...(options || {}),
    headers: { ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error("DELETE request failed");
  return true;
}

