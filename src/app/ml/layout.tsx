import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laboratório de ML — Palco Conectado",
  description: "Métricas, testes e técnicas dos modelos de cachê, aceite, agrupamento e recomendação.",
};

export default function MlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
