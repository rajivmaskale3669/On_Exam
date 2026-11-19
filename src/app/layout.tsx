import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AuraExam | Luxury Online Examination System",
  description: "A production-grade, secure, and elegant online examination platform for academic institutions and enterprises.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2B2B2B] antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FCFBF8",
              border: "1px solid #DFC775",
              color: "#2B2B2B",
              fontFamily: "var(--font-inter)",
              boxShadow: "0 10px 30px -4px rgba(11, 61, 46, 0.1)",
              borderRadius: "0.75rem",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
