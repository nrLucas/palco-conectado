export const LAB_DATA_FILES = {
  "proposals.csv": "ml/data/proposals.csv",
  "talents.csv": "ml/data/talents.csv",
} as const;

export const LAB_FILES = {
  "metrics.json": "ml/artifacts/metrics.json",
  "proposals.csv": LAB_DATA_FILES["proposals.csv"],
  "talents.csv": LAB_DATA_FILES["talents.csv"],
  "regression.json": "ml/artifacts/regression.json",
  "classification.json": "ml/artifacts/classification.json",
  "venue-classification.json": "ml/artifacts/venue-classification.json",
  "clustering.json": "ml/artifacts/clustering.json",
  "recommendation-priors.json": "ml/artifacts/recommendation-priors.json",
  "sanity.json": "ml/artifacts/sanity.json",
} as const;

export type LabFileName = keyof typeof LAB_FILES;

export const LAB_FILE_LABELS: Record<LabFileName, string> = {
  "metrics.json": "metrics.json",
  "proposals.csv": "proposals.csv — dados de treino (propostas)",
  "talents.csv": "talents.csv — dados de treino (talentos)",
  "regression.json": "regression.json",
  "classification.json": "classification.json",
  "venue-classification.json": "venue-classification.json — chance de a casa aceitar",
  "clustering.json": "clustering.json",
  "recommendation-priors.json": "recommendation-priors.json",
  "sanity.json": "sanity.json",
};

export const LAB_FIGURES = {
  "regressao_previsto_vs_real.png": {
    file: "ml/figures/regressao_previsto_vs_real.png",
    title: "Regressão: previsto contra observado",
    caption: "Cada ponto é uma proposta do conjunto de teste. A reta é a previsão da regressão linear.",
  },
  "classificacao_matriz_confusao.png": {
    file: "ml/figures/classificacao_matriz_confusao.png",
    title: "Classificação: matriz de confusão",
    caption: "Logística no teste, na ordem recusada e aceita.",
  },
  "cluster_silhueta.png": {
    file: "ml/figures/cluster_silhueta.png",
    title: "Agrupamento: silhueta por k",
    caption: "k foi escolhido de 2 a 6. O maior valor ficou em k = 6.",
  },
  "cluster_pca.png": {
    file: "ml/figures/cluster_pca.png",
    title: "Agrupamento: projeção PCA",
    caption: "Os seis grupos vistos em duas componentes, só para leitura. O modelo usa a distância aos centróides.",
  },
} as const;

export type LabFigureName = keyof typeof LAB_FIGURES;

export function isLabDataFile(name: string): name is keyof typeof LAB_DATA_FILES {
  return name in LAB_DATA_FILES;
}

export function isLabFileName(name: string | null): name is LabFileName {
  return !!name && name in LAB_FILES;
}

export function isLabFigureName(name: string | null): name is LabFigureName {
  return !!name && name in LAB_FIGURES;
}
