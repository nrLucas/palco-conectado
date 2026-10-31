"use client";

import { Timeline } from "@/components/aceternity";
import { LandingCta } from "@/components/landing";
import { Accordion, Card, Tabs } from "@heroui/react";
import { Building2, Guitar, Music2 } from "lucide-react";

const universalSteps = [
  {
    title: "1. Crie sua conta",
    content: (
      <p>
        Cadastre-se gratuitamente com e-mail e senha. Você pode explorar bandas e estabelecimentos
        antes de completar seu perfil.
      </p>
    ),
  },
  {
    title: "2. Escolha seu perfil",
    content: (
      <p>
        Defina se você é contratante (bar/restaurante), banda ou músico freelance. Cada perfil tem
        ferramentas específicas para suas necessidades.
      </p>
    ),
  },
  {
    title: "3. Explore e filtre oportunidades",
    content: (
      <p>
        Use filtros por cidade, estilo musical, orçamento e avaliação para encontrar o match ideal
        — seja uma banda para contratar ou um local para tocar.
      </p>
    ),
  },
  {
    title: "4. Envie ou receba propostas",
    content: (
      <p>
        Contratantes enviam propostas com data, horário e valor. Bandas e músicos recebem
        notificações e podem aceitar, recusar ou negociar.
      </p>
    ),
  },
  {
    title: "5. Confirme o show e avalie",
    content: (
      <p>
        Após o evento, ambas as partes avaliam a experiência. Isso constrói reputação e facilita
        futuras contratações.
      </p>
    ),
  },
] as const;

const profileFlows = {
  banda: {
    label: "Banda",
    icon: Music2,
    steps: [
      "Complete o perfil com integrantes, estilos e faixa de preço.",
      "Adicione fotos e vídeos ao portfólio.",
      "Receba propostas de estabelecimentos interessados.",
      "Aceite shows e gerencie sua agenda.",
    ],
  },
  musico: {
    label: "Músico",
    icon: Guitar,
    steps: [
      "Cadastre instrumentos, experiência e disponibilidade.",
      "Indique se busca gigs freelance ou banda fixa.",
      "Seja encontrado por contratantes e bandas.",
      "Negocie valores e confirme apresentações.",
    ],
  },
  contratante: {
    label: "Bar / Restaurante",
    icon: Building2,
    steps: [
      "Cadastre seu estabelecimento com capacidade e orçamento.",
      "Busque bandas por estilo, cidade e avaliação.",
      "Envie propostas com data, horário e valor.",
      "Acompanhe respostas e confirme o show.",
    ],
  },
} as const;

const faqItems = [
  {
    question: "O Palco Conectado é gratuito?",
    answer:
      "Sim. Você pode criar conta e explorar a plataforma gratuitamente. Planos pagos oferecem mais propostas e recursos avançados.",
  },
  {
    question: "Preciso ter CNPJ para me cadastrar?",
    answer:
      "Não. Bandas, músicos e pequenos estabelecimentos podem se cadastrar como pessoa física. CNPJ é opcional para contratantes.",
  },
  {
    question: "Como funcionam as propostas?",
    answer:
      "Contratantes enviam propostas com data, horário e valor. A banda ou músico recebe uma notificação e pode aceitar, recusar ou contra-propor.",
  },
  {
    question: "Posso ter mais de um perfil?",
    answer:
      "Sim. Um usuário pode ter perfis de banda e músico, por exemplo, e alternar entre eles pelo menu de perfil.",
  },
  {
    question: "Como funciona a avaliação?",
    answer:
      "Após o show confirmado, ambas as partes podem avaliar de 1 a 5 estrelas e deixar comentário. Isso alimenta a reputação pública.",
  },
  {
    question: "Posso testar antes de criar conta?",
    answer:
      "Sim. Explore bandas, músicos e estabelecimentos sem login. Use a conta demo demo@palco.com (senha: demo123) para testar propostas.",
  },
] as const;

export default function ComoFuncionaPage() {
  return (
    <main>
      <section className="border-b border-border bg-surface/30 py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-display mb-4 text-3xl font-semibold tracking-tight">Como funciona?</h1>
          <p className="text-muted mx-auto max-w-[65ch] text-sm leading-relaxed">
            O Palco Conectado é um marketplace que une bandas, músicos e estabelecimentos. Da
            descoberta à avaliação pós-show, tudo acontece em uma plataforma pensada para música ao
            vivo.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-20" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="font-display mb-10 text-lg font-semibold">
          Fluxo em 5 passos
        </h2>
        <Timeline data={[...universalSteps]} />
      </section>

      <section
        className="border-y border-border bg-surface/30 py-16 md:py-20"
        aria-labelledby="profiles-heading"
      >
        <div className="container mx-auto px-4">
          <h2 id="profiles-heading" className="font-display mb-8 text-lg font-semibold">
            Como funciona para...
          </h2>

          <Tabs defaultSelectedKey="banda" className="w-full">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Fluxo por perfil">
                {Object.entries(profileFlows).map(([key, { label, icon: Icon }]) => (
                  <Tabs.Tab key={key} id={key}>
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" /> {label}
                    </span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>

            {Object.entries(profileFlows).map(([key, { steps }]) => (
              <Tabs.Panel key={key} id={key} className="mt-8">
                <Card>
                  <Card.Content className="p-6">
                    <ol className="space-y-4">
                      {steps.map((step, i) => (
                        <li key={step} className="flex gap-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                            {i + 1}
                          </span>
                          <p className="pt-1 text-sm leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </Card.Content>
                </Card>
              </Tabs.Panel>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-20" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display mb-8 text-lg font-semibold">
          Perguntas frequentes
        </h2>
        <Accordion className="max-w-3xl">
          {faqItems.map(({ question, answer }) => (
            <Accordion.Item key={question} id={question}>
              <Accordion.Heading>
                <Accordion.Trigger>{question}</Accordion.Trigger>
                <Accordion.Indicator />
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <p className="text-muted leading-relaxed">{answer}</p>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      <LandingCta />
    </main>
  );
}
