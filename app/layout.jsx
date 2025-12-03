

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/context/ThemeProvider";
import { SocketProvider } from "@/context/SocketContext";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ace80",
  description: "Ace80 App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <SocketProvider>
            <Toaster position="top-right" richColors />
            
            {/* Sidebar Layout */}
            <SidebarProvider
              style={{
                "--sidebar-width": "calc(var(--spacing) * 56)",
                "--header-height": "calc(var(--spacing) * 12)",
              }}
            >
              <AppSidebar variant="inset" />
              <SidebarInset>
                <div className="flex flex-1 flex-col">
                  <div className="@container/main flex flex-1 flex-col gap-2">
                    <SiteHeader />
                    {children} {/* Your page content */}
                  </div>
                </div>
              </SidebarInset>
            </SidebarProvider>

          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
