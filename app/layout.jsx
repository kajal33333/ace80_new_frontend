import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/context/ThemeProvider";
import { SocketProvider } from "@/context/SocketContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgriTech",
  description: "AgriTech App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <ThemeProvider>
          <SocketProvider>
            <Toaster position="top-right" richColors />
            {children}
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
