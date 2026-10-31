"use client";

import { LAB_FIGURES, type LabFigureName } from "@/lib/ml/lab-files";
import { useEffect, useState } from "react";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

type Score = { mae: number; rmse: number; r2: number };
type ClassScore = { accuracy: number; precision: number; recall: number; f1: number };

type LabMetrics = {
  seed: number;
  proposals: number;
  talents: number;
  acceptanceRate: number;
  notes: string[];
  regression: { linear: Score; randomForest: Score };
  classification: { logistic: ClassScore; randomForest: ClassScore };
  clustering: { k: number; silhouette: number; adjustedRandVsLatentSegment: number };
  venueClassification?: { logistic: ClassScore; randomForest: ClassScore };
  venueAcceptanceRate?: number;
};

function decimal(value: number, digits = 2) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function Figure({ name }: { name: LabFigureName }) {
  const figure = LAB_FIGURES[name];
  return (
    <figure className="rounded-[var(--radius)] border border-border bg-surface/50 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/ml/lab/figure?name=${name}`}
        alt={figure.title}
        className="w-full rounded-[var(--radius)] bg-background"
      />
      <figcaption className="text-muted mt-2 text-xs leading-relaxed">
        <span className="text-foreground font-medium">{figure.title}. </span>
        {figure.caption}
      </figcaption>
    </figure>
  );
}

function taskBlocks(metrics: LabMetrics) {
  const linear = metrics.regression.linear;
  const forest = metrics.regression.randomForest;
  const logistic = metrics.classification.logistic;
  const forestClass = metrics.classification.randomForest;
  const proposals = `${metrics.proposals} propostas sintéticas (proposals.csv, semente ${metrics.seed}, divisão 80/20)`;

  return [
    {
      title: "Previsão (Regressão)",
      figure: "regressao_previsto_vs_real.png" as LabFigureName,
      paragraphs: [
        "Prever o cachê do show, um número contínuo. Na aplicação, regressão linear depois do StandardScaler. O Random Forest entra só na comparação.",
        `${proposals}. O alvo é amount_target, o cachê observado. A data vira três colunas: sexta, sábado e domingo. Dia de semana fica com as três em zero. Também entram capacidade, integrantes, experiência, mesma cidade, nota, shows, ponto médio do preço do talento, ponto médio do orçamento, gênero (Rock é a referência) e tipo da casa (Bar é a referência). O valor ofertado não entra nesta conta.`,
        `No teste, linear MAE ${currency.format(linear.mae)}, RMSE ${currency.format(linear.rmse)}, R² ${decimal(linear.r2)}. Floresta: MAE ${currency.format(forest.mae)}, RMSE ${currency.format(forest.rmse)}, R² ${decimal(forest.r2)}.`,
      ],
    },
    {
      title: "Classificação (Aprendizado Supervisionado)",
      figure: "classificacao_matriz_confusao.png" as LabFigureName,
      paragraphs: [
        "Classificação binária: a proposta termina aceita ou recusada. Na aplicação, regressão logística. O limiar do relatório é 0,5. Na tela, alta começa em 0,66 e média em 0,40.",
        `As mesmas ${metrics.proposals} linhas, rótulo accepted. Não há pendente no CSV. O sinal da oferta é o logaritmo da razão entre o valor ofertado e o cachê sugerido. Perto do cachê a chance já fica alta; bem acima, inclusive um valor muito maior, ela satura; abaixo, fica baixa. date_load (0 a 5) conta propostas já feitas naquela casa e naquela data e reduz a chance. Também entram gênero compatível, capacidade, experiência, mesma cidade, dias de antecedência e nota. No treino, o cachê sugerido das linhas de treino vem de validação cruzada com 5 dobras.`,
        `Logística: acurácia ${decimal(logistic.accuracy)}, precisão ${decimal(logistic.precision)}, recall ${decimal(logistic.recall)}, F1 ${decimal(logistic.f1)}. Floresta: acurácia ${decimal(forestClass.accuracy)}, precisão ${decimal(forestClass.precision)}, recall ${decimal(forestClass.recall)}, F1 ${decimal(forestClass.f1)}. Aceite no histórico: ${decimal(metrics.acceptanceRate * 100, 1)}%.`,
        metrics.venueClassification
          ? `A segunda logística responde se a casa aceita o pedido da banda, com o rótulo venue_accepted nas mesmas linhas. O logaritmo do pedido sobre o cachê e a razão com o orçamento puxam a chance para baixo quando o pedido sobe. Logística: acurácia ${decimal(metrics.venueClassification.logistic.accuracy)}, F1 ${decimal(metrics.venueClassification.logistic.f1)}. Floresta: acurácia ${decimal(metrics.venueClassification.randomForest.accuracy)}, F1 ${decimal(metrics.venueClassification.randomForest.f1)}. Aceite da casa no histórico: ${decimal((metrics.venueAcceptanceRate ?? 0) * 100, 1)}%.`
          : "",
      ].filter(Boolean),
    },
    {
      title: "Agrupamento/Clusterização (Aprendizado não Supervisionado)",
      figure: "cluster_silhueta.png" as LabFigureName,
      paragraphs: [
        "Agrupar talentos parecidos. Não há rótulo de grupo no treino. Algoritmo: K-Means com StandardScaler.",
        `${metrics.talents} talentos (talents.csv). Features: ponto médio do preço, integrantes, experiência, nota, gênero e cidade. O segmento latente (palco de bairro, casa noturna, sala íntima) só entra no Rand ajustado.`,
        `k = ${metrics.clustering.k}, silhueta ${decimal(metrics.clustering.silhouette, 3)}, Rand ajustado ${decimal(metrics.clustering.adjustedRandVsLatentSegment, 3)}. Na aplicação, um talento vai para o centróide mais próximo. O PCA só desenha os grupos; a distância real continua no espaço original.`,
      ],
    },
    {
      title: "Recomendação de pares",
      figure: null,
      paragraphs: [
        "Sugerir casas para uma banda e bandas para uma casa. Não há um quarto algoritmo: o ranking reusa a regressão e a logística. Músicos ficam de fora.",
        `Não há um quarto treino. A taxa histórica agrega as ${metrics.proposals} propostas por tipo de casa e gênero, com Laplace (aceitos + 1) / (total + 2). A oferta de referência é a próxima sexta com pelo menos 21 dias, e o valor ofertado é o próprio cachê previsto, então a razão fica em 1. Nesse ranking a data ocupada entra como zero.`,
        "Não há métrica própria. O score é 70% da probabilidade da logística e 30% do histórico. Propostas reais já decididas ajustam a taxa daquela casa pela metade.",
      ],
    },
  ];
}

export function TechniqueReport() {
  const [metrics, setMetrics] = useState<LabMetrics | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/ml/lab/metrics")
      .then((response) => {
        if (!response.ok) throw new Error("metrics");
        return response.json();
      })
      .then((payload) => {
        if (active) setMetrics(payload.metrics);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (failed) return <p className="text-danger mt-8 text-sm">Não foi possível ler as métricas do treino.</p>;
  if (!metrics) return <p className="text-muted mt-8 text-sm">Lendo as métricas…</p>;

  return (
    <div className="mt-10 space-y-10">
      {metrics.notes[0] && (
        <p className="text-muted max-w-[65ch] text-sm leading-relaxed">{metrics.notes[0]}</p>
      )}
      {taskBlocks(metrics).map((block) => (
        <section
          key={block.title}
          className={block.figure ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]" : "max-w-3xl"}
        >
          <div>
            <h2 className="font-display text-lg font-semibold">{block.title}</h2>
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-muted mt-3 text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          {block.figure === "cluster_silhueta.png" ? (
            <div className="space-y-4">
              <Figure name="cluster_silhueta.png" />
              <Figure name="cluster_pca.png" />
            </div>
          ) : (
            block.figure && <Figure name={block.figure} />
          )}
        </section>
      ))}
    </div>
  );
}
