import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/frontend/context/AppContext";
import Nav from "@/frontend/components/ui/Nav";

export const metadata: Metadata = {
  title: "HighFin — Learn Investing",
  description: "A hands-on investment simulator for high school students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AppProvider>
          <Nav />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
