import type { Metadata } from "next";
import { AuthProvider } from "@/src/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helpdesk Dashboard",
  description: "Manage helpdesk tickets with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full text-slate-900 border-slate-200" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
