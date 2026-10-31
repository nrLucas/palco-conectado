import classificationArtifact from "./artifacts/classification.json";
import clusteringArtifact from "./artifacts/clustering.json";
import regressionArtifact from "./artifacts/regression.json";
import venueArtifact from "./artifacts/venue-classification.json";
import {
  classificationVector,
  clusteringVector,
  regressionVector,
  venueVector,
  type ClassificationInput,
  type ClusteringArtifact,
  type NegotiationInput,
  type TalentInput,
} from "./features";

function scale(values: number[], mean: number[], scaleValues: number[]): number[] {
  return values.map((value, index) => (value - mean[index]) / (scaleValues[index] || 1));
}

function dot(left: number[], right: number[]): number {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function sigmoid(value: number): number {
  const clipped = Math.max(-40, Math.min(40, value));
  return 1 / (1 + Math.exp(-clipped));
}

export function predictCache(input: NegotiationInput): number {
  const scaled = scale(
    regressionVector(input),
    regressionArtifact.mean,
    regressionArtifact.scale,
  );
  return dot(scaled, regressionArtifact.coef) + regressionArtifact.intercept;
}

export function predictAcceptance(input: ClassificationInput): number {
  const scaled = scale(
    classificationVector(input),
    classificationArtifact.mean,
    classificationArtifact.scale,
  );
  const decision = dot(scaled, classificationArtifact.coef) + classificationArtifact.intercept;
  return sigmoid(decision);
}

export function predictVenueAcceptance(input: ClassificationInput): number {
  const scaled = scale(
    venueVector(input, venueArtifact),
    venueArtifact.mean,
    venueArtifact.scale,
  );
  const decision = dot(scaled, venueArtifact.coef) + venueArtifact.intercept;
  return sigmoid(decision);
}

export type AcceptanceLabel = "alta" | "media" | "baixa";

export function acceptanceLabel(probability: number): AcceptanceLabel {
  if (probability >= 0.66) return "alta";
  if (probability >= 0.4) return "media";
  return "baixa";
}

export function roundCache(amount: number): number {
  return Math.max(200, Math.round(amount / 10) * 10);
}

export interface ClusterAssignment {
  clusterId: number;
  clusterName: string;
  distance: number;
  scaled: number[];
}

function euclidean(left: number[], right: number[]): number {
  return Math.sqrt(left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0));
}

export function assignCluster(
  input: TalentInput,
  artifact: ClusteringArtifact = clusteringArtifact,
): ClusterAssignment {
  const scaled = scale(clusteringVector(input, artifact), artifact.mean, artifact.scale);
  let clusterId = 0;
  let distance = Number.POSITIVE_INFINITY;
  artifact.centroids.forEach((centroid, index) => {
    const current = euclidean(scaled, centroid);
    if (current < distance) {
      distance = current;
      clusterId = index;
    }
  });
  return {
    clusterId,
    clusterName: artifact.clusterNames[clusterId] ?? `Grupo ${clusterId + 1}`,
    distance,
    scaled,
  };
}

export function distanceBetween(left: number[], right: number[]): number {
  return euclidean(left, right);
}
