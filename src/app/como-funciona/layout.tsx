import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como Funciona | Palco Conectado",
  description:
    "Entenda como conectar bandas, músicos e estabelecimentos para shows ao vivo no Palco Conectado.",
};

export default function ComoFuncionaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
