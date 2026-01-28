import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PalcoMatch - Marketplace de Shows",
  description: "Conecte-se com bandas, músicos e estabelecimentos para shows inesquecíveis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            {/* Wrapper to inject router context if needed by SiteHeader, 
                but SiteHeader usages of NavLink need to be replaced with Next Link 
                or we need a router provider. 
                Next.js uses its own routing. We will need to update SiteHeader.
            */}
            <SiteHeader />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
