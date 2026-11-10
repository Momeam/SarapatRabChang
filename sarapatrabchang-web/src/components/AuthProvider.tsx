"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseClient, type MinimalSupabaseUser } from "@/lib/supabase";

interface AuthContextValue {
  user: MinimalSupabaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  syncError: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = getSupabaseClient();
  const [user, setUser] = useState<MinimalSupabaseUser | null>(null);
  const [loading, setLoading] = useState(Boolean(client));
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    if (!client) return;

    let active = true;
    const syncProfile = async (accessToken: string) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          throw new Error(`บันทึกโปรไฟล์ลงฐานข้อมูลไม่สำเร็จ (HTTP ${response.status})`);
        }
        if (active) setSyncError("");
      } catch (error) {
        if (active) {
          setSyncError(
            error instanceof Error ? error.message : "เชื่อมต่อ API เพื่อบันทึกโปรไฟล์ไม่สำเร็จ",
          );
        }
      }
    };

    const { data } = client.auth.onAuthStateChange((_event: any, session: any) => {
      if (active) {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.access_token) void syncProfile(session.access_token);
        else setSyncError("");
      }
    });

    client.auth.getUser().then(({ data: result, error }: any) => {
      if (!active) return;
      if (error) {
        setUser(null);
        setSyncError(error.message);
      } else {
        setUser(result.user);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isConfigured: Boolean(client),
      syncError,
      signOut: async () => {
        if (!client) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
        const { error } = await client.auth.signOut();
        if (error) throw error;
      },
    }),
    [client, loading, syncError, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {syncError && (
        <div
          role="alert"
          className="bg-red-50 px-4 py-2 text-center text-sm text-red-700"
        >
          ไม่สามารถซิงก์บัญชีกับ API ได้: {syncError}
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
