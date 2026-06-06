"use client";

import { DotBackground } from "@/components/aceternity";
import { Card, Chip, Tabs } from "@heroui/react";
import { motion } from "framer-motion";
import { Building2, Music2, Send } from "lucide-react";

export function LandingProductPreview() {
  return (
    <section
      aria-labelledby="preview-heading"
      className="relative overflow-hidden border-y border-border py-20"
    >
      <DotBackground className="absolute inset-0 opacity-60" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 id="preview-heading" className="font-display mb-4 text-3xl font-bold md:text-4xl">
            Tudo que você precisa para fechar o show
          </h2>
          <p className="text-muted text-lg">
            Busque, negocie e confirme — do primeiro contato à avaliação pós-evento.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-12 max-w-4xl"
        >
          <Card className="overflow-hidden border-border shadow-overlay">
            <Card.Header className="border-b border-border bg-surface/80 px-6 py-4">
              <Tabs defaultSelectedKey="bandas" className="w-full">
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Preview do produto">
                    <Tabs.Tab id="bandas">
                      <span className="inline-flex items-center gap-2">
                        <Music2 className="h-4 w-4" /> Bandas
                      </span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="propostas">
                      <span className="inline-flex items-center gap-2">
                        <Send className="h-4 w-4" /> Propostas
                      </span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel id="bandas" className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: "The Violet Cats", genre: "Rock/Indie", rating: 4.8, city: "São Paulo" },
                      { name: "Samba da Vila", genre: "Samba/Pagode", rating: 4.6, city: "Rio de Janeiro" },
                      { name: "Trio Jazz&Co", genre: "Jazz", rating: 4.9, city: "Belo Horizonte" },
                    ].map((band) => (
                      <div
                        key={band.name}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                      >
                        <div>
                          <p className="font-medium">{band.name}</p>
                          <p className="text-muted text-sm">
                            {band.genre} · {band.city}
                          </p>
                        </div>
                        <Chip size="sm" variant="secondary">
                          ★ {band.rating}
                        </Chip>
                      </div>
                    ))}
                  </div>
                </Tabs.Panel>

                <Tabs.Panel id="propostas" className="p-6">
                  <div className="rounded-lg border border-border bg-background p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="font-medium">Proposta para Bar Aurora</p>
                        <p className="text-muted text-sm">The Violet Cats · 15 de junho</p>
                      </div>
                      <Chip size="sm" color="warning">
                        Pendente
                      </Chip>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md bg-surface p-3">
                        <p className="text-muted text-xs uppercase">Valor</p>
                        <p className="font-semibold">R$ 900</p>
                      </div>
                      <div className="rounded-md bg-surface p-3">
                        <p className="text-muted text-xs uppercase">Horário</p>
                        <p className="font-semibold">21h – 00h</p>
                      </div>
                    </div>
                  </div>
                </Tabs.Panel>
              </Tabs>
            </Card.Header>
            <Card.Content className="flex items-center gap-3 px-6 py-4 text-sm text-muted">
              <Building2 className="h-4 w-4 shrink-0 text-accent" />
              Perfis completos, filtros avançados e propostas em tempo real.
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
