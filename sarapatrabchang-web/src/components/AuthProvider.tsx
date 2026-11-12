"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthRequestError,
  getCurrentUser,
  login,
  logout,
  register,
  type AuthUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  syncError: string;
  signIn: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  signUp: (credentials: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (!(error instanceof AuthRequestError) || error.status !== 401) {
          setSyncError(
            error instanceof Error ? error.message : "ตรวจสอบบัญชีไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      syncError,
      signIn: async (credentials) => {
        const signedInUser = await login(credentials);
        setUser(signedInUser);
        setSyncError("");
        return signedInUser;
      },
      signUp: async (credentials) => {
        const registeredUser = await register(credentials);
        setUser(registeredUser);
        setSyncError("");
      },
      signOut: async () => {
        await logout();
        setUser(null);
        setSyncError("");
      },
    }),
    [loading, syncError, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {syncError && (
        <div
          role="alert"
          className="bg-red-50 px-4 py-2 text-center text-sm text-red-700"
        >
          ไม่สามารถตรวจสอบบัญชีกับ API ได้: {syncError}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth ต้องใช้ภายใน AuthProvider");
  return context;
}
