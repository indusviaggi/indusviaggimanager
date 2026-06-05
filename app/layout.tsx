import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticket Manager",
  description: "Indus Viaggio Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppSidebar />
          <PageContainer>{children}</PageContainer>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
