import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "sarapatrabchang (สารพัดรับจ้าง) - บริการช่างและผู้ช่วยมืออาชีพใกล้บ้านคุณ",
  description: "ค้นหาช่างและผู้ช่วยมืออาชีพใกล้บ้านคุณ จองง่าย ปลอดภัย มั่นใจด้วยระบบประกันกลาง (Escrow)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900 antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
