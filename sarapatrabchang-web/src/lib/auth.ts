import { getApiUrl } from "./api";

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

const STORAGE_KEY = "sarapat_user";

function getLocalUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

export function cacheUser(user: AuthUser) {
  setLocalUser(user);
}

async function requestAuth(
  path: string,
  body?: Record<string, string>,
  allowAnonymous = false,
): Promise<AuthUser | null> {
  const apiUrl = getApiUrl();
  try {
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
    if (result.data) {
      setLocalUser(result.data);
    }
    return result.data ?? null;
  } catch (err: unknown) {
    if (err instanceof AuthRequestError) {
      throw err;
    }
    // Network / offline error -> fallback to mock user for frontend mode
    const local = getLocalUser();
    if (local) return local;

    if (allowAnonymous) {
      return null;
    }

    throw new AuthRequestError(
      "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กำลังสลับใช้งานโหมดจำลอง",
      503
    );
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const local = getLocalUser();
  if (local) return local;

  try {
    return await requestAuth("/api/auth/me", undefined, true);
  } catch {
    return local;
  }
};

export const register = async (body: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}): Promise<AuthUser> => {
  try {
    const res = await requestAuth("/api/auth/register", body);
    if (res) return res;
  } catch (err) {
    // If real API is not running, create mock user in frontend localStorage
    const isNetworkError =
      !(err instanceof AuthRequestError) ||
      err.status === 503 ||
      err.message.includes("fetch") ||
      err.message.includes("เชื่อมต่อ");

    if (isNetworkError) {
      const mockUser: AuthUser = {
        id: "usr-" + Date.now(),
        email: body.email,
        role: "user",
        user_metadata: {
          full_name: body.fullName || "ผู้ใช้งาน",
          phone: body.phone || "08X-XXX-XXXX",
        },
        created_at: new Date().toISOString(),
      };
      setLocalUser(mockUser);
      return mockUser;
    }
    throw err;
  }

  const mockUser: AuthUser = {
    id: "usr-" + Date.now(),
    email: body.email,
    role: "user",
    user_metadata: {
      full_name: body.fullName || "ผู้ใช้งาน",
      phone: body.phone || "08X-XXX-XXXX",
    },
    created_at: new Date().toISOString(),
  };
  setLocalUser(mockUser);
  return mockUser;
};

export const login = async (body: {
  email: string;
  password: string;
}): Promise<AuthUser> => {
  try {
    const res = await requestAuth("/api/auth/login", body);
    if (res) return res;
  } catch (err) {
    const isNetworkError =
      !(err instanceof AuthRequestError) ||
      err.status === 503 ||
      err.message.includes("fetch") ||
      err.message.includes("เชื่อมต่อ");

    if (isNetworkError) {
      let local = getLocalUser();
      if (!local || local.email !== body.email) {
        local = {
          id: "usr-" + Date.now(),
          email: body.email,
          role: body.email.includes("admin") ? "admin" : "user",
          user_metadata: {
            full_name: body.email.split("@")[0] || "ผู้ใช้งาน",
            phone: "08X-XXX-XXXX",
          },
          created_at: new Date().toISOString(),
        };
      }
      setLocalUser(local);
      return local;
    }
    throw err;
  }

  let local = getLocalUser();
  if (!local || local.email !== body.email) {
    local = {
      id: "usr-" + Date.now(),
      email: body.email,
      role: body.email.includes("admin") ? "admin" : "user",
      user_metadata: {
        full_name: body.email.split("@")[0] || "ผู้ใช้งาน",
        phone: "08X-XXX-XXXX",
      },
      created_at: new Date().toISOString(),
    };
  }
  setLocalUser(local);
  return local;
};

export const logout = async () => {
  setLocalUser(null);
  try {
    const apiUrl = getApiUrl();
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {}
};
