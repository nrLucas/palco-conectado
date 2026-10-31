'use client';

import { fetchRecommendations, type RecommendationMatch } from '@/lib/api/ml';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

interface RecommendationsProps {
  kind: 'band' | 'establishment';
  id: string;
}

export function Recommendations({ kind, id }: RecommendationsProps) {
  const [referenceDate, setReferenceDate] = useState<string | null>(null);
  const [items, setItems] = useState<RecommendationMatch[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    fetchRecommendations(kind, id)
      .then((response) => {
        if (!active) return;
        setReferenceDate(response.referenceDate);
        setItems(response.items);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [kind, id]);

  if (failed || !referenceDate) return null;

  const title =
    kind === 'band'
      ? 'Estabelecimentos com maior chance de aceitar'
      : 'Bandas com maior chance de fechar';
  const intro =
    kind === 'band'
      ? 'Casas ranqueadas pela chance de aceitar uma proposta desta banda.'
      : 'Bandas ranqueadas pela chance de a casa aceitar uma proposta.';

  return (
    <section className="mt-8 rounded-[var(--radius)] border border-border bg-surface/60 p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="text-muted mt-2 max-w-2xl text-sm leading-relaxed">
        {intro} A oferta de referência é o cachê previsto para a sexta-feira {formatDate(referenceDate)}.
        O ranking junta a regressão logística (70%) e o histórico de aceite do tipo de casa (30%).
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm">Ainda não há pares suficientes no catálogo.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block rounded-[var(--radius)] border border-border bg-background px-4 py-3 transition-colors hover:border-accent/50"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-display text-lg font-semibold tabular-nums">
                    {Math.round(item.score * 100)}%
                  </span>
                </span>
                <span className="text-muted mt-1 block text-sm">
                  {item.detail} · {item.location} · cachê {currency.format(item.suggestedAmount)}
                </span>
                <span className="mt-2 block text-sm">{item.reasons.join(' · ')}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}
