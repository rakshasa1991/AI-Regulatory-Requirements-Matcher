import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "sonner";
import { ReactQueryProvider } from "@/components/providers/QueryClientProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "AI-ассистент регуляторных требований",
  description: "AI-ассистент для сопоставления регуляторных требований",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <ReactQueryProvider>
          <TooltipProvider>
            <Sidebar />
            <main className="ml-60 min-h-screen bg-background">
              {children}
            </main>
            <Toaster position="top-right" />
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
