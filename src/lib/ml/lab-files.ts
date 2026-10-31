import "server-only";

import clusteringArtifact from "./artifacts/clustering.json";
import regressionArtifact from "./artifacts/regression.json";
import path from "path";
import {
  LAB_FIGURES,
  LAB_FILES,
  type LabFigureName,
  type LabFileName,
} from "./lab-catalog";

export {
  LAB_DATA_FILES,
  LAB_FIGURES,
  LAB_FILE_LABELS,
  LAB_FILES,
  isLabDataFile,
  isLabFigureName,
  isLabFileName,
} from "./lab-catalog";
export type { LabFigureName, LabFileName } from "./lab-catalog";

export function labFilePath(name: LabFileName): string {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), LAB_FILES[name]);
}

export function labFigurePath(name: LabFigureName): string {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), LAB_FIGURES[name].file);
}

export const labOptions = {
  genres: regressionArtifact.vocab.genres,
  establishmentTypes: regressionArtifact.vocab.establishmentTypes,
  cities: clusteringArtifact.vocab.cities.map((city) => city.label),
  experiences: [
    { id: 0, label: "Iniciante" },
    { id: 1, label: "Intermediário" },
    { id: 2, label: "Profissional" },
  ],
};
