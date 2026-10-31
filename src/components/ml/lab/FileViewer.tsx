"use client";

import { FilterSelect } from "@/components/shared/FilterSelect";
import { useEffect, useState } from "react";

export function FileViewer({ files }: { files: Array<{ id: string; label: string }> }) {
  const [name, setName] = useState(files[0]?.id ?? "metrics.json");
  const [body, setBody] = useState("");
  const [failed, setFailed] = useState(false);
  const generatedByAi = name.endsWith(".csv");

  useEffect(() => {
    let active = true;
    setFailed(false);
    fetch(`/api/ml/lab/file?name=${encodeURIComponent(name)}`)
      .then((response) => {
        if (!response.ok) throw new Error("file");
        return response.text();
      })
      .then((text) => {
        if (!active) return;
        try {
          setBody(JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          setBody(text);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [name]);

  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-semibold">Arquivos gerados</h2>
      <p className="text-muted mt-1 max-w-[65ch] text-sm leading-relaxed">
        Os JSON são a saída do treino. Os CSV são o histórico usado para treinar: foram gerados por
        inteligência artificial, com semente 42, e não são propostas nem talentos reais do Palco.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-sm font-medium">Ver arquivo gerado</p>
          <FilterSelect
            label="Ver arquivo gerado"
            value={name}
            onChange={setName}
            options={files.map((file) => ({ id: file.id, label: file.label }))}
          />
        </div>
        <a
          className="text-accent text-sm font-medium underline-offset-4 hover:underline"
          href={`/api/ml/lab/file?name=${encodeURIComponent(name)}&download=1`}
        >
          Baixar {name}
        </a>
      </div>
      {generatedByAi && (
        <p className="mt-4 max-w-[65ch] text-sm leading-relaxed">
          Arquivo gerado por inteligência artificial. O script do projeto criou estas linhas para o
          treino. Elas não vieram de cadastros nem de propostas reais.
        </p>
      )}
      {failed ? (
        <p className="text-danger mt-4 text-sm">Não foi possível abrir este arquivo.</p>
      ) : (
        <pre className="mt-4 max-h-[32rem] overflow-auto rounded-[var(--radius)] border border-border bg-background p-4 text-xs leading-relaxed">
          {body || "Carregando…"}
        </pre>
      )}
    </section>
  );
}
