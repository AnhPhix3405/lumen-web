const BASE_URL = "http://localhost:8888";

export class ApiError extends Error {
  status: number;
  errorCode: string | null;
  payload: unknown;

  constructor(message: string, status: number, payload: Record<string, unknown> | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = (payload?.errorCode as string) ?? null;
    this.payload = payload;
  }
}

export const apiClient = async <T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send cookies (refreshtoken)
    ...options,
  });

  if (!res.ok) {
    let payload: Record<string, unknown> | null = null;
    try {
      payload = await res.json();
    } catch (_) { }

    throw new ApiError(
      (payload?.message as string) ?? "Request failed",
      res.status,
      payload
    );
  }

  if (res.status === 204) return null as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
};
