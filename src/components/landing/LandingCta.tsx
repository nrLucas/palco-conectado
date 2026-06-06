"use client";

import { useAuth } from "@/lib/auth";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";

export function LandingCta() {
  const { openAuthModal } = useAuth();

  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden py-24">
      <div className="from-accent/20 via-accent/5 absolute inset-0 bg-gradient-to-br to-transparent" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="cta-heading" className="font-display mb-4 text-3xl font-bold md:text-5xl">
            Pronto para subir no palco?
          </h2>
          <p className="text-muted mx-auto mb-8 max-w-xl text-lg">
            Crie sua conta gratuitamente ou explore com a conta demo{" "}
            <span className="text-accent font-medium">demo@palco.com</span>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button className="button--hero px-8" onPress={() => openAuthModal("signup")}>
              Criar conta grátis
            </Button>
            <Link href="/bandas">
              <Button variant="secondary" className="px-8">
                Explorar sem cadastro
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
