"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "5+", label: "Bandas cadastradas" },
  { value: "3", label: "Estabelecimentos parceiros" },
  { value: "50+", label: "Propostas enviadas" },
  { value: "4.7", label: "Avaliação média" },
] as const;

export function LandingStats() {
  return (
    <section aria-label="Métricas da plataforma" className="border-b border-border bg-surface/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-3xl font-bold text-accent md:text-4xl">{value}</p>
              <p className="text-muted mt-1 text-sm">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
