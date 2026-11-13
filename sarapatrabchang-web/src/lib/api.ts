export function getApiUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const pageHost = window.location.hostname;
    const loopbackHosts = ["localhost", "127.0.0.1", "::1", "[::1]"];
    if (configuredUrl) {
      const apiUrl = new URL(configuredUrl);
      if (loopbackHosts.includes(apiUrl.hostname)) {
        apiUrl.hostname = pageHost;
      }
      return apiUrl.origin;
    }
    return `${window.location.protocol}//${pageHost}:4000`;
  }
  return configuredUrl ?? "http://localhost:4000";
}

export async function requestApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    credentials: "include",
    headers,
    cache: "no-store",
  });
  let result: { data?: T; error?: { message?: string } };
  try {
    result = await response.json();
  } catch {
    throw new Error("เซิร์ฟเวอร์ส่งข้อมูลไม่ถูกต้อง");
  }
  if (!response.ok) {
    throw new Error(result.error?.message ?? "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
  }
  if (result.data === undefined) {
    throw new Error("เซิร์ฟเวอร์ส่งข้อมูลไม่ครบ");
  }
  return result.data;
}
