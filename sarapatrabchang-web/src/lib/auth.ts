export interface AuthUser {
  id: string;
  email: string;
  role: string;
  user_metadata: {
    full_name: string;
    phone: string;
  };
  created_at: string;
}

export class AuthRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthRequestError";
    this.status = status;
  }
}

function getApiUrl() {
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

async function requestAuth(
  path: string,
  body?: Record<string, string>,
  allowAnonymous = false,
): Promise<AuthUser | null> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}${path}`, {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let result: { data?: AuthUser | null; error?: { message?: string } };
  try {
    result = await response.json();
  } catch {
    throw new AuthRequestError("เซิร์ฟเวอร์ส่งข้อมูลไม่ถูกต้อง", response.status);
  }
  if (!response.ok) {
    throw new AuthRequestError(
      result.error?.message ?? "ดำเนินการเกี่ยวกับบัญชีไม่สำเร็จ",
      response.status,
    );
  }
  if (result.data === undefined || (result.data === null && !allowAnonymous)) {
    throw new AuthRequestError("เซิร์ฟเวอร์ส่งข้อมูลบัญชีไม่ครบ", response.status);
  }
  return result.data ?? null;
}

function requireUser(user: AuthUser | null): AuthUser {
  if (!user) {
    throw new AuthRequestError("เซิร์ฟเวอร์ส่งข้อมูลบัญชีไม่ครบ", 200);
  }
  return user;
}

export const getCurrentUser = () => requestAuth("/api/auth/me", undefined, true);
export const register = async (body: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}) => requireUser(await requestAuth("/api/auth/register", body));
export const login = async (body: { email: string; password: string }) =>
  requireUser(await requestAuth("/api/auth/login", body));
export const logout = async () => {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new AuthRequestError("ออกจากระบบไม่สำเร็จ", response.status);
  }
};
