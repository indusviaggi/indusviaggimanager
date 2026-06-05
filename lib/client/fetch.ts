async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if ([401, 403].includes(response.status) && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    const error = (data as { message?: string })?.message || response.statusText;
    return Promise.reject(error);
  }
  return data as T;
}

function request(method: string) {
  return async <T>(url: string, body?: unknown): Promise<T> => {
    const options: RequestInit = {
      method,
      credentials: "include",
      headers: {},
    };
    if (body) {
      (options.headers as Record<string, string>)["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    return handleResponse<T>(response);
  };
}

export const api = {
  get: request("GET"),
  post: request("POST"),
  put: request("PUT"),
  delete: request("DELETE"),
  async getBinary(url: string): Promise<Blob> {
    const response = await fetch(url, { method: "GET", credentials: "include" });
    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        window.location.href = "/login";
      }
      throw new Error(response.statusText);
    }
    return response.blob();
  },
};
