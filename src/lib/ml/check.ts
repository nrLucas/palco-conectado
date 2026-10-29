import sanity from "./artifacts/sanity.json";
import { assignCluster, predictAcceptance, predictCache } from "./predict";
import type { ClassificationInput, NegotiationInput, TalentInput } from "./features";

const CACHE_TOLERANCE = 0.05;
const PROBABILITY_TOLERANCE = 1e-4;

function assertClose(actual: number, expected: number, tolerance: number, label: string) {
  const gap = Math.abs(actual - expected);
  if (gap > tolerance) {
    throw new Error(`${label}: obtido ${actual}, esperado ${expected} (diferença ${gap})`);
  }
}

for (const [index, sample] of sanity.regression.entries()) {
  const predicted = predictCache(sample.input as NegotiationInput);
  assertClose(predicted, sample.expected, CACHE_TOLERANCE, `regressão ${index}`);
}

for (const [index, sample] of sanity.classification.entries()) {
  const predicted = predictAcceptance(sample.input as ClassificationInput);
  assertClose(predicted, sample.expected, PROBABILITY_TOLERANCE, `classificação ${index}`);
}

for (const [index, sample] of sanity.clustering.entries()) {
  const assigned = assignCluster(sample.input as TalentInput);
  if (assigned.clusterId !== sample.expectedCluster) {
    throw new Error(
      `cluster ${index}: obtido ${assigned.clusterId}, esperado ${sample.expectedCluster}`,
    );
  }
}

console.log(
  `inferência conferida: ${sanity.regression.length} regressões, ${sanity.classification.length} classificações, ${sanity.clustering.length} clusters`,
);
