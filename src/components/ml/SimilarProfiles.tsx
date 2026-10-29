'use client';

import { fetchSimilarProfiles, type SimilarProfile } from '@/lib/api/ml';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SimilarProfilesProps {
  kind: 'band' | 'musician';
  id: string;
}

export function SimilarProfiles({ kind, id }: SimilarProfilesProps) {
  const [clusterName, setClusterName] = useState<string | null>(null);
  const [similar, setSimilar] = useState<SimilarProfile[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    fetchSimilarProfiles(kind, id)
      .then((response) => {
        if (!active) return;
        setClusterName(response.clusterName);
        setSimilar(response.similar);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [kind, id]);

  if (failed || !clusterName) return null;

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface/60 p-5">
      <p className="text-muted text-xs uppercase tracking-[0.16em]">Grupo de perfis</p>
      <h2 className="font-display mt-1 text-2xl font-semibold">{clusterName}</h2>
      <p className="text-muted mt-2 max-w-2xl text-sm leading-relaxed">
        Perfis próximos por gênero, cidade, faixa de preço e experiência. O agrupamento é um
        K-Means treinado em um histórico sintético do marketplace.
      </p>
      {similar.length === 0 ? (
        <p className="mt-4 text-sm">Nenhum outro perfil do catálogo caiu neste grupo ainda.</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {similar.map((profile) => (
            <li key={`${profile.kind}-${profile.id}`}>
              <Link
                href={profile.href}
                className="block rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-accent/50"
              >
                <span className="font-medium">{profile.name}</span>
                <span className="text-muted mt-1 block text-sm">
                  {profile.genre} · {profile.location}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
