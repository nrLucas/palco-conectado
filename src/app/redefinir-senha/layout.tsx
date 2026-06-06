import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redefinir senha | Palco Conectado",
  description: "Defina uma nova senha para sua conta no Palco Conectado.",
};

export default function RedefinirSenhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
