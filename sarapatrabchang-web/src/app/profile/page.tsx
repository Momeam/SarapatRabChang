"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SwitchRoleCard from "@/components/profile/SwitchRoleCard";
import InterestsCard from "@/components/profile/InterestsCard";
import PrivacyInfoCard from "@/components/profile/PrivacyInfoCard";
import ContactAddressCard from "@/components/profile/ContactAddressCard";
import TaxInfoCard from "@/components/profile/TaxInfoCard";
import PublicReviewsFeed from "@/components/profile/PublicReviewsFeed";
import { requestApi } from "@/lib/api";
import type { AccountProfile, ProfileUpdate } from "@/lib/profile";

type ProfileLoadState =
  | { status: "loading"; userId: string | null }
  | { status: "error"; userId: string; message: string }
  | { status: "loaded"; userId: string; profile: AccountProfile };

export default function ProfilePage() {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const userId = user?.id;
  const [profileState, setProfileState] = useState<ProfileLoadState>({
    status: "loading",
    userId: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) return;

    let active = true;
    requestApi<AccountProfile>("/api/profile")
      .then((data) => {
        if (active) {
          setProfileState({ status: "loaded", userId, profile: data });
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setProfileState({
            status: "error",
            userId,
            message:
              requestError instanceof Error
                ? requestError.message
                : "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ",
          });
        }
      })

    return () => {
      active = false;
    };
  }, [authLoading, reloadKey, userId]);

  const saveProfile = useCallback(
    async (updates: ProfileUpdate) => {
      const saved = await requestApi<AccountProfile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setProfileState({ status: "loaded", userId: saved.id, profile: saved });
      updateProfile({
        full_name: saved.fullName,
        phone: saved.phone,
      });
      return saved;
    },
    [updateProfile],
  );

  const profile =
    profileState.status === "loaded" && profileState.userId === userId
      ? profileState.profile
      : null;
  const loadError =
    profileState.status === "error" && profileState.userId === userId
      ? profileState.message
      : "";
  const isLoading =
    authLoading ||
    Boolean(
      userId &&
        (profileState.status === "loading" || profileState.userId !== userId),
    );

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
      })
    : "ยังไม่มีข้อมูล";

  const displayName = profile?.fullName.trim() || profile?.email || "ผู้ใช้";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-orange-600">หน้าหลัก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-500">บัญชีของฉัน</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">โปรไฟล์และข้อมูลส่วนตัว</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              โปรไฟล์และข้อมูลส่วนตัว
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              ข้อมูลบัญชีและรีวิวโหลดจากฐานข้อมูล
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white shadow-xs w-fit">
            <Lock className="w-3.5 h-3.5 text-orange-400" />
            <span>มุมมองเจ้าของบัญชี</span>
          </span>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            กำลังโหลดข้อมูลโปรไฟล์...
          </div>
        ) : !userId ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm text-zinc-700">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์</p>
            <Link
              href="/auth"
              className="mt-4 inline-flex rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p role="alert" className="text-sm text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                if (!userId) return;
                setProfileState({ status: "loading", userId });
                setReloadKey((key) => key + 1);
              }}
              className="mt-4 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              ลองโหลดอีกครั้ง
            </button>
          </div>
        ) : profile ? (
          <>
            <ProfileHeader
              fullName={profile.fullName}
              displayName={displayName}
              avatarUrl={profile.avatarUrl}
              bio={profile.bio}
              memberSince={memberSince}
              rating={profile.rating}
              reviewCount={profile.reviewCount}
              isProvider={profile.isProvider}
              onSave={saveProfile}
            />

            <SwitchRoleCard isProvider={profile.isProvider} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <InterestsCard initial={profile.interests} onSave={saveProfile} />
                <PrivacyInfoCard />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <ContactAddressCard
                  email={profile.email}
                  phone={profile.phone}
                  address={profile.address}
                  onSave={saveProfile}
                />
                <TaxInfoCard
                  displayName={displayName}
                  email={profile.email}
                  taxId={profile.taxId}
                  taxAddress={profile.taxAddress}
                  taxEmail={profile.taxEmail}
                  onSave={saveProfile}
                />
              </div>
            </div>

            <PublicReviewsFeed reviews={profile.reviews} />
          </>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            ไม่พบข้อมูลโปรไฟล์
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
