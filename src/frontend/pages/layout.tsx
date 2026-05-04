import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { AppProvider } from "@/frontend/context/AppContext";
import Nav from "@/frontend/components/ui/Nav";
import ChatPanelLoader from "@/frontend/components/ui/ChatPanelLoader";

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
          <div className="no-print"><ChatPanelLoader /></div>
        </AppProvider>
      </body>
    </html>
  );
}
