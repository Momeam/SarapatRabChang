"use client";

import AdminLayout from "@/app/admin/layout";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
