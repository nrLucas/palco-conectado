"""Treina só a logística da casa, sem regravar regressão, banda ou clusters.

Acrescenta venue_accepted nas propostas atuais. O sorteio usa outra semente,
então as colunas que os modelos já treinados leem não mudam.
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from domain import (
    lead_days,
    ordered_vector,
    parse_price_midpoint,
    regression_features,
    venue_acceptance_probability,
    venue_feature_names,
    venue_features,
)

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "proposals.csv"
ML_ARTIFACTS = ROOT / "artifacts"
APP_ARTIFACTS = ROOT.parent / "src" / "lib" / "ml" / "artifacts"
SEED = 42
LABEL_SEED = 1042
PROTECTED = ("regression.json", "classification.json", "clustering.json", "recommendation-priors.json")


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sigmoid(value: float) -> float:
    clipped = max(-40.0, min(40.0, value))
    return 1 / (1 + math.exp(-clipped))


def read_rows() -> tuple[list[str], list[dict[str, str]]]:
    with DATA.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        fieldnames = list(reader.fieldnames or [])
        return fieldnames, list(reader)


def write_rows(fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    with DATA.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def label_rows(rows: list[dict[str, str]]) -> None:
    rng = np.random.default_rng(LABEL_SEED)
    for row in rows:
        prepared = {
            "fair_price": row["fair_price"],
            "amount": row["amount"],
            "venue_budget_mid": row["venue_budget_mid"],
            "date_load": row["date_load"],
            "genre_match": row["genre_match"],
            "same_city": row["same_city"],
            "experience": row["experience"],
            "lead_days": row["lead_days"],
        }
        probability = venue_acceptance_probability(prepared)
        row["venue_accepted"] = str(int(rng.random() < probability))


def predict_cache(record: dict[str, str], artifact: dict) -> float:
    prepared = {
        "genre": record["genre"],
        "establishment_type": record["establishment_type"],
        "capacity": record["capacity"],
        "members": record["members"],
        "experience": record["experience"],
        "same_city": record["same_city"],
        "is_friday": record["is_friday"],
        "is_saturday": record["is_saturday"],
        "is_sunday": record["is_sunday"],
        "rating": record["rating"],
        "shows": record["shows"],
        "talent_price_mid": parse_price_midpoint(record["talent_price_text"]),
        "venue_budget_mid": parse_price_midpoint(record["venue_budget_text"]),
    }
    names = artifact["featureNames"]
    vector = np.array(ordered_vector(regression_features(prepared), names), dtype=float)
    mean = np.array(artifact["mean"], dtype=float)
    scale = np.array(artifact["scale"], dtype=float)
    coef = np.array(artifact["coef"], dtype=float)
    scaled = (vector - mean) / np.where(scale == 0, 1.0, scale)
    return float(scaled @ coef + artifact["intercept"])


def clf_metrics(y_true, y_pred) -> dict:
    matrix = confusion_matrix(y_true, y_pred, labels=[0, 1]).tolist()
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "confusionMatrix": matrix,
    }


def main() -> None:
    before = {name: file_hash(ML_ARTIFACTS / name) for name in PROTECTED}
    fieldnames, rows = read_rows()
    if "venue_accepted" not in fieldnames:
        fieldnames.append("venue_accepted")
    label_rows(rows)
    write_rows(fieldnames, rows)

    regression = json.loads((ML_ARTIFACTS / "regression.json").read_text(encoding="utf-8"))
    band = json.loads((ML_ARTIFACTS / "classification.json").read_text(encoding="utf-8"))
    frame = pd.read_csv(DATA)
    suggested = [predict_cache(row, regression) for row in rows]
    names = venue_feature_names()
    features = []
    for row, cache in zip(rows, suggested, strict=True):
        features.append(
            venue_features(
                {
                    "amount": row["amount"],
                    "suggested_amount": cache,
                    "venue_budget_mid": parse_price_midpoint(row["venue_budget_text"]),
                    "date_load": row["date_load"],
                    "genre_match": row["genre_match"],
                    "capacity": row["capacity"],
                    "experience": row["experience"],
                    "same_city": row["same_city"],
                    "lead_days": lead_days(row["event_date"], row["created_at"]),
                    "rating": row["rating"],
                }
            )
        )
    x = pd.DataFrame(features, columns=names)
    y = frame["venue_accepted"].to_numpy(dtype=int)
    indices = np.arange(len(frame))
    idx_train, idx_test = train_test_split(indices, test_size=0.2, random_state=SEED)
    logistic = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(max_iter=500, random_state=SEED)),
        ]
    )
    forest = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        random_state=SEED,
        n_jobs=-1,
    )
    logistic.fit(x.iloc[idx_train], y[idx_train])
    forest.fit(x.iloc[idx_train], y[idx_train])
    logistic_proba = logistic.predict_proba(x.iloc[idx_test])[:, 1]
    logistic_pred = (logistic_proba >= 0.5).astype(int)
    forest_pred = forest.predict(x.iloc[idx_test])
    logistic_metrics = clf_metrics(y[idx_test], logistic_pred)
    forest_metrics = clf_metrics(y[idx_test], forest_pred)

    model = logistic.named_steps["model"]
    scaler = logistic.named_steps["scaler"]
    scale = np.where(scaler.scale_ == 0, 1.0, scaler.scale_)
    coef = model.coef_.ravel().astype(float)
    if coef[names.index("offer_log")] >= 0 or coef[names.index("budget_log")] >= 0:
        raise SystemExit("a casa deveria recusar pedido alto e pedido acima do orçamento")

    artifact = {
        "task": "venue-classification",
        "model": "logistic",
        "positiveClass": "venue_accepted",
        "featureNames": names,
        "mean": scaler.mean_.astype(float).tolist(),
        "scale": scale.astype(float).tolist(),
        "coef": coef.tolist(),
        "intercept": float(model.intercept_.ravel()[0]),
        "threshold": 0.5,
        "vocab": band["vocab"],
        "comparison": {"logistic": logistic_metrics, "randomForest": forest_metrics},
    }
    payload = json.dumps(artifact, ensure_ascii=False, indent=2)
    for folder in (ML_ARTIFACTS, APP_ARTIFACTS):
        (folder / "venue-classification.json").write_text(payload, encoding="utf-8")

    cases = []
    for position in list(idx_test)[:2]:
        source = rows[position]
        cache = suggested[position]
        raw = {
            "capacity": int(source["capacity"]),
            "members": int(source["members"]),
            "experience": int(source["experience"]),
            "talentLocation": source["talent_location"],
            "venueLocation": source["venue_location"],
            "eventDate": source["event_date"][:10],
            "rating": float(source["rating"]),
            "shows": int(source["shows"]),
            "talentPrice": source["talent_price_text"],
            "venueBudget": source["venue_budget_text"],
            "genre": source["genre_raw"],
            "establishmentType": source["establishment_type"],
            "amount": float(source["amount"]),
            "asOf": source["created_at"][:10],
            "suggestedAmount": cache,
            "dateLoad": int(source["date_load"]),
        }
        vector = np.array([features[position][name] for name in names], dtype=float)
        scaled = (vector - scaler.mean_) / scale
        expected = sigmoid(float(scaled @ coef + artifact["intercept"]))
        cases.append({"input": raw, "expected": expected})

    for folder in (ML_ARTIFACTS, APP_ARTIFACTS):
        sanity_path = folder / "sanity.json"
        sanity = json.loads(sanity_path.read_text(encoding="utf-8"))
        sanity["venue"] = cases
        sanity_path.write_text(json.dumps(sanity, ensure_ascii=False, indent=2), encoding="utf-8")

    metrics_path = ML_ARTIFACTS / "metrics.json"
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    metrics["venueClassification"] = artifact["comparison"]
    metrics["venueAcceptanceRate"] = float(y.mean())
    metrics_path.write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")

    after = {name: file_hash(ML_ARTIFACTS / name) for name in PROTECTED}
    changed = [name for name in PROTECTED if before[name] != after[name]]
    if changed:
        raise SystemExit(f"modelos protegidos foram alterados: {changed}")

    print(
        f"casa logística {logistic_metrics['accuracy']:.3f} | "
        f"floresta {forest_metrics['accuracy']:.3f} | "
        f"aceite {y.mean():.2%}"
    )


if __name__ == "__main__":
    main()
