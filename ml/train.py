"""Treina regressão, classificação e K-Means e exporta artefatos JSON.

A interface usa regressão linear, regressão logística e os centróides.
Random Forest entra só como comparação, com as métricas no relatório.
"""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    adjusted_rand_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    silhouette_score,
)
from sklearn.model_selection import cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from domain import (
    BAND_EXPERIENCE_CUTS,
    CITIES,
    CITY_SLUGS,
    ESTABLISHMENT_TYPES,
    GENRE_COMPATIBILITY,
    GENRE_REFERENCE,
    GENRES,
    TYPE_REFERENCE,
    WEEKEND_FROM_WEEKDAY,
    canonical_genre,
    city_slug,
    classification_feature_names,
    classification_features,
    clustering_feature_names,
    clustering_features,
    experience_from_shows,
    is_weekend,
    lead_days,
    ordered_vector,
    parse_price_midpoint,
    regression_feature_names,
    regression_features,
    same_city,
)

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
FIGURES = ROOT / "figures"
ML_ARTIFACTS = ROOT / "artifacts"
APP_ARTIFACTS = ROOT.parent / "src" / "lib" / "ml" / "artifacts"
SEED = 42


def frame_from_features(rows: list[dict], names: list[str]) -> pd.DataFrame:
    return pd.DataFrame([{name: row[name] for name in names} for row in rows], columns=names)


def regression_rows(frame: pd.DataFrame) -> list[dict]:
    rows = []
    for record in frame.to_dict(orient="records"):
        genre = canonical_genre(record["genre_raw"])
        prepared = {
            "genre": genre,
            "establishment_type": record["establishment_type"],
            "capacity": record["capacity"],
            "members": record["members"],
            "experience": record["experience"],
            "same_city": same_city(record["talent_location"], record["venue_location"]),
            "is_weekend": is_weekend(str(record["event_date"])),
            "rating": record["rating"],
            "shows": record["shows"],
            "talent_price_mid": parse_price_midpoint(record["talent_price_text"]),
            "venue_budget_mid": parse_price_midpoint(record["venue_budget_text"]),
        }
        rows.append(regression_features(prepared))
    return rows


def scaler_payload(scaler: StandardScaler) -> dict:
    scale = np.where(scaler.scale_ == 0, 1.0, scaler.scale_)
    return {
        "mean": scaler.mean_.astype(float).tolist(),
        "scale": scale.astype(float).tolist(),
    }


def regression_metrics(y_true, y_pred) -> dict:
    return {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "r2": float(r2_score(y_true, y_pred)),
    }


def price_band(mean_price: float) -> str:
    if mean_price < 700:
        return "cachê enxuto"
    if mean_price < 1200:
        return "cachê médio"
    return "cachê alto"


def dump(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    proposals = pd.read_csv(DATA / "proposals.csv")
    talents = pd.read_csv(DATA / "talents.csv")

    reg_names = regression_feature_names()
    x_reg = frame_from_features(regression_rows(proposals), reg_names)
    y_reg = proposals["amount_target"].to_numpy(dtype=float)

    x_train, x_test, y_train, y_test, idx_train, idx_test = train_test_split(
        x_reg,
        y_reg,
        proposals.index,
        test_size=0.2,
        random_state=SEED,
    )

    linear = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("model", LinearRegression()),
        ]
    )
    forest = RandomForestRegressor(
        n_estimators=200,
        max_depth=8,
        random_state=SEED,
        n_jobs=-1,
    )
    linear.fit(x_train, y_train)
    forest.fit(x_train, y_train)

    linear_pred = linear.predict(x_test)
    forest_pred = forest.predict(x_test)
    reg_linear_metrics = regression_metrics(y_test, linear_pred)
    reg_forest_metrics = regression_metrics(y_test, forest_pred)

    suggested_train = cross_val_predict(linear, x_train, y_train, cv=5)
    suggested_test = linear.predict(x_test)
    suggested = pd.Series(index=proposals.index, dtype=float)
    suggested.loc[idx_train] = suggested_train
    suggested.loc[idx_test] = suggested_test

    clf_names = classification_feature_names()
    clf_rows = []
    for position, record in enumerate(proposals.to_dict(orient="records")):
        prepared = {
            "amount": record["amount"],
            "suggested_amount": float(suggested.loc[proposals.index[position]]),
            "genre_match": record["genre_match"],
            "capacity": record["capacity"],
            "experience": record["experience"],
            "same_city": record["same_city"],
            "lead_days": lead_days(str(record["event_date"]), str(record["created_at"])),
            "rating": record["rating"],
        }
        clf_rows.append(classification_features(prepared))
    x_clf = frame_from_features(clf_rows, clf_names)
    y_clf = proposals["accepted"].to_numpy(dtype=int)

    x_clf_train = x_clf.loc[idx_train]
    x_clf_test = x_clf.loc[idx_test]
    y_clf_train = y_clf[x_clf_train.index.to_numpy()]
    y_clf_test = y_clf[x_clf_test.index.to_numpy()]

    logistic = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(max_iter=500, random_state=SEED)),
        ]
    )
    forest_clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        random_state=SEED,
        n_jobs=-1,
    )
    logistic.fit(x_clf_train, y_clf_train)
    forest_clf.fit(x_clf_train, y_clf_train)

    logistic_proba = logistic.predict_proba(x_clf_test)[:, 1]
    logistic_pred = (logistic_proba >= 0.5).astype(int)
    forest_clf_pred = forest_clf.predict(x_clf_test)

    def clf_metrics(y_true, y_pred) -> dict:
        matrix = confusion_matrix(y_true, y_pred, labels=[0, 1]).tolist()
        return {
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision": float(precision_score(y_true, y_pred, zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, zero_division=0)),
            "f1": float(f1_score(y_true, y_pred, zero_division=0)),
            "confusionMatrix": matrix,
        }

    clf_linear_metrics = clf_metrics(y_clf_test, logistic_pred)
    clf_forest_metrics = clf_metrics(y_clf_test, forest_clf_pred)
    acceptance_rate = float(y_clf.mean())

    cluster_names = clustering_feature_names()
    cluster_rows = []
    for record in talents.to_dict(orient="records"):
        prepared = {
            "genre": canonical_genre(record["genre_raw"]),
            "location": record["location"],
            "price_mid": parse_price_midpoint(record["price_text"]),
            "members": record["members"],
            "experience": record["experience"],
            "rating": record["rating"],
        }
        cluster_rows.append(clustering_features(prepared))
    x_cluster = frame_from_features(cluster_rows, cluster_names)
    cluster_scaler = StandardScaler()
    x_cluster_scaled = cluster_scaler.fit_transform(x_cluster)

    silhouette_by_k = {}
    best_k = 2
    best_score = -1.0
    for k in range(2, 7):
        model = KMeans(n_clusters=k, n_init=10, random_state=SEED)
        labels = model.fit_predict(x_cluster_scaled)
        score = float(silhouette_score(x_cluster_scaled, labels))
        silhouette_by_k[str(k)] = score
        if score > best_score:
            best_score = score
            best_k = k

    kmeans = KMeans(n_clusters=best_k, n_init=10, random_state=SEED)
    labels = kmeans.fit_predict(x_cluster_scaled)
    talents = talents.copy()
    talents["cluster"] = labels
    ari = float(adjusted_rand_score(talents["segment"], labels))

    display_names = []
    used = {}
    for cluster_id in range(best_k):
        members = talents[talents["cluster"] == cluster_id]
        dominant = members["genre"].mode().iloc[0]
        label = f"{dominant} · {price_band(float(members['price_mid'].mean()))}"
        used[label] = used.get(label, 0) + 1
        if used[label] > 1:
            label = f"{label} {used[label]}"
        display_names.append(label)

    FIGURES.mkdir(parents=True, exist_ok=True)
    save_regression_plot(y_test, linear_pred, forest_pred)
    save_confusion_plot(clf_linear_metrics["confusionMatrix"])
    save_cluster_plots(x_cluster_scaled, labels, silhouette_by_k, best_k, display_names)

    reg_model = linear.named_steps["model"]
    reg_scaler = linear.named_steps["scaler"]
    clf_model = logistic.named_steps["model"]
    clf_scaler = logistic.named_steps["scaler"]

    regression_artifact = {
        "task": "regression",
        "model": "linear",
        "target": "amount_target",
        "featureNames": reg_names,
        **scaler_payload(reg_scaler),
        "coef": reg_model.coef_.astype(float).tolist(),
        "intercept": float(reg_model.intercept_),
        "vocab": {
            "genres": GENRES,
            "genreReference": GENRE_REFERENCE,
            "establishmentTypes": ESTABLISHMENT_TYPES,
            "typeReference": TYPE_REFERENCE,
            "weekendFromWeekday": WEEKEND_FROM_WEEKDAY,
            "bandExperienceCuts": list(BAND_EXPERIENCE_CUTS),
        },
        "comparison": {
            "linear": reg_linear_metrics,
            "randomForest": reg_forest_metrics,
        },
    }

    classification_artifact = {
        "task": "classification",
        "model": "logistic",
        "positiveClass": "accepted",
        "featureNames": clf_names,
        **scaler_payload(clf_scaler),
        "coef": clf_model.coef_.ravel().astype(float).tolist(),
        "intercept": float(clf_model.intercept_.ravel()[0]),
        "threshold": 0.5,
        "vocab": {
            "genres": GENRES,
            "establishmentTypes": ESTABLISHMENT_TYPES,
            "compatibility": {
                kind: sorted(genres) for kind, genres in GENRE_COMPATIBILITY.items()
            },
            "weekendFromWeekday": WEEKEND_FROM_WEEKDAY,
            "bandExperienceCuts": list(BAND_EXPERIENCE_CUTS),
        },
        "comparison": {
            "logistic": clf_linear_metrics,
            "randomForest": clf_forest_metrics,
        },
    }

    cluster_scale = np.where(cluster_scaler.scale_ == 0, 1.0, cluster_scaler.scale_)
    clustering_artifact = {
        "task": "clustering",
        "model": "kmeans",
        "featureNames": cluster_names,
        "mean": cluster_scaler.mean_.astype(float).tolist(),
        "scale": cluster_scale.astype(float).tolist(),
        "centroids": kmeans.cluster_centers_.astype(float).tolist(),
        "k": int(best_k),
        "silhouette": float(best_score),
        "silhouetteByK": silhouette_by_k,
        "clusterNames": display_names,
        "adjustedRandVsLatentSegment": ari,
        "vocab": {
            "genres": GENRES,
            "cities": [{"label": label, "slug": slug} for label, slug in zip(CITIES, CITY_SLUGS)],
            "bandExperienceCuts": list(BAND_EXPERIENCE_CUTS),
        },
    }

    sanity = build_sanity(
        proposals,
        talents,
        idx_test,
        linear,
        logistic,
        kmeans,
        cluster_scaler,
        reg_names,
        clf_names,
        cluster_names,
    )

    metrics = {
        "synthetic": True,
        "seed": SEED,
        "split": "80/20",
        "proposals": int(len(proposals)),
        "talents": int(len(talents)),
        "acceptanceRate": acceptance_rate,
        "regression": regression_artifact["comparison"],
        "classification": classification_artifact["comparison"],
        "clustering": {
            "k": clustering_artifact["k"],
            "silhouette": clustering_artifact["silhouette"],
            "silhouetteByK": silhouette_by_k,
            "clusterNames": display_names,
            "adjustedRandVsLatentSegment": ari,
        },
        "notes": [
            "O histórico é sintético, calibrado nas faixas de preço, cidades e gêneros do seed do Palco.",
            "A regressão prevê o cachê observado. A classificação usa a razão entre o valor ofertado e o cachê sugerido pela regressão linear, além da distância dessa razão a 1,05 (ratio_gap).",
            "No teste, a regressão linear supera o Random Forest. Na classificação, o Random Forest fica à frente da logística.",
            "O segmento latente dos talentos não entra no K-Means. O índice de Rand ajustado só mede se os grupos recuperaram essa estrutura.",
            "A aplicação infere com os coeficientes lineares e os centróides. Random Forest fica como modelo de comparação no relatório.",
        ],
    }

    priors = recommendation_priors(proposals)

    for folder in (ML_ARTIFACTS, APP_ARTIFACTS):
        dump(folder / "regression.json", regression_artifact)
        dump(folder / "classification.json", classification_artifact)
        dump(folder / "clustering.json", clustering_artifact)
        dump(folder / "sanity.json", sanity)
        dump(folder / "recommendation-priors.json", priors)
    dump(ML_ARTIFACTS / "metrics.json", metrics)

    preview_seed_clusters(kmeans, cluster_scaler, cluster_names, display_names)
    print("regressão linear", reg_linear_metrics)
    print("regressão forest", reg_forest_metrics)
    print("classificação logística", clf_linear_metrics)
    print("classificação forest", clf_forest_metrics)
    print("clusters", best_k, best_score, display_names, "ARI", round(ari, 3))
    print("aceite", round(acceptance_rate, 3))


def recommendation_priors(proposals: pd.DataFrame) -> dict:
    """Taxa de aceite por tipo de casa e gênero, com suavização de Laplace."""
    alpha = 1.0
    cells = {}
    grouped = proposals.groupby(["establishment_type", "genre"], dropna=False)["accepted"]
    for (kind, genre), series in grouped:
        accepted = int(series.sum())
        total = int(series.shape[0])
        cells[f"{kind}|{genre}"] = {
            "establishmentType": str(kind),
            "genre": str(genre),
            "accepted": accepted,
            "total": total,
            "rate": (accepted + alpha) / (total + 2 * alpha),
        }
    accepted = int(proposals["accepted"].sum())
    total = int(len(proposals))
    return {
        "smoothing": alpha,
        "modelWeight": 0.7,
        "historyWeight": 0.3,
        "global": {
            "accepted": accepted,
            "total": total,
            "rate": (accepted + alpha) / (total + 2 * alpha),
        },
        "byTypeAndGenre": cells,
    }


def build_sanity(
    proposals,
    talents,
    idx_test,
    linear,
    logistic,
    kmeans,
    cluster_scaler,
    reg_names,
    clf_names,
    cluster_names,
) -> dict:
    sample_proposals = proposals.loc[list(idx_test)[:2]]
    regression_cases = []
    classification_cases = []
    for record in sample_proposals.to_dict(orient="records"):
        raw = {
            "capacity": int(record["capacity"]),
            "members": int(record["members"]),
            "experience": int(record["experience"]),
            "talentLocation": record["talent_location"],
            "venueLocation": record["venue_location"],
            "eventDate": str(record["event_date"])[:10],
            "rating": float(record["rating"]),
            "shows": int(record["shows"]),
            "talentPrice": record["talent_price_text"],
            "venueBudget": record["venue_budget_text"],
            "genre": record["genre_raw"],
            "establishmentType": record["establishment_type"],
        }
        prepared = {
            "genre": canonical_genre(raw["genre"]),
            "establishment_type": raw["establishmentType"],
            "capacity": raw["capacity"],
            "members": raw["members"],
            "experience": raw["experience"],
            "same_city": same_city(raw["talentLocation"], raw["venueLocation"]),
            "is_weekend": is_weekend(raw["eventDate"]),
            "rating": raw["rating"],
            "shows": raw["shows"],
            "talent_price_mid": parse_price_midpoint(raw["talentPrice"]),
            "venue_budget_mid": parse_price_midpoint(raw["venueBudget"]),
        }
        vector = ordered_vector(regression_features(prepared), reg_names)
        expected = float(linear.predict(pd.DataFrame([dict(zip(reg_names, vector))]))[0])
        regression_cases.append({"input": raw, "expected": expected})

        proposal_index = record["proposal_id"]
        source = proposals.loc[proposals["proposal_id"] == proposal_index].iloc[0]
        class_raw = {
            **raw,
            "amount": float(source["amount"]),
            "asOf": str(source["created_at"])[:10],
            "suggestedAmount": expected,
        }
        class_prepared = {
            "amount": class_raw["amount"],
            "suggested_amount": expected,
            "genre_match": int(source["genre_match"]),
            "capacity": class_raw["capacity"],
            "experience": class_raw["experience"],
            "same_city": prepared["same_city"],
            "lead_days": lead_days(class_raw["eventDate"], class_raw["asOf"]),
            "rating": class_raw["rating"],
        }
        class_vector = ordered_vector(classification_features(class_prepared), clf_names)
        probability = float(
            logistic.predict_proba(pd.DataFrame([dict(zip(clf_names, class_vector))]))[0, 1]
        )
        classification_cases.append({"input": class_raw, "expected": probability})

    clustering_cases = []
    for record in talents.head(3).to_dict(orient="records"):
        raw = {
            "kind": record["kind"],
            "genre": record["genre_raw"],
            "location": record["location"],
            "members": int(record["members"]),
            "experience": int(record["experience"]),
            "shows": int(record["shows"]),
            "rating": float(record["rating"]),
            "price": record["price_text"],
        }
        if record["kind"] == "band":
            raw["experience"] = experience_from_shows(raw["shows"])
        prepared = {
            "genre": canonical_genre(raw["genre"]),
            "location": raw["location"],
            "price_mid": parse_price_midpoint(raw["price"]),
            "members": raw["members"],
            "experience": raw["experience"],
            "rating": raw["rating"],
        }
        vector = np.array(ordered_vector(clustering_features(prepared), cluster_names), dtype=float)
        scaled = (vector - cluster_scaler.mean_) / np.where(
            cluster_scaler.scale_ == 0, 1.0, cluster_scaler.scale_
        )
        distances = np.linalg.norm(kmeans.cluster_centers_ - scaled, axis=1)
        clustering_cases.append(
            {
                "input": raw,
                "expectedCluster": int(np.argmin(distances)),
                "citySlug": city_slug(raw["location"]),
            }
        )

    return {
        "regression": regression_cases,
        "classification": classification_cases,
        "clustering": clustering_cases,
    }


def preview_seed_clusters(kmeans, cluster_scaler, cluster_names, display_names) -> None:
    samples = [
        ("The Violet Cats", "band", "Rock/Indie", "São Paulo - SP", 4, 23, 4.8, "R$ 600 - R$ 1.200"),
        ("Samba da Vila", "band", "Samba/Pagode", "Rio de Janeiro - RJ", 6, 45, 4.6, "R$ 400 - R$ 900"),
        ("Trio Jazz&Co", "band", "Jazz", "Belo Horizonte - MG", 3, 18, 4.9, "R$ 700 - R$ 1.500"),
        ("MPB Roots", "band", "MPB", "São Paulo - SP", 2, 31, 4.7, "R$ 350 - R$ 800"),
        ("Eletronic Pulse", "band", "Eletrônica", "Curitiba - PR", 2, 12, 4.5, "R$ 800 - R$ 2.000"),
        ("Diego Martins", "musician", "Rock", "São Paulo - SP", 1, 56, 4.8, "R$ 200 - R$ 400"),
        ("Carla Nunes", "musician", "MPB", "Rio de Janeiro - RJ", 1, 34, 4.9, "R$ 250 - R$ 500"),
        ("Rafael Costa", "musician", "Blues", "Belo Horizonte - MG", 1, 42, 4.6, "R$ 180 - R$ 350"),
        ("Julia Freitas", "musician", "Jazz", "São Paulo - SP", 1, 28, 4.7, "R$ 300 - R$ 600"),
    ]
    print("prévia do catálogo demo:")
    for name, kind, genre, location, members, shows, rating, price in samples:
        experience = experience_from_shows(shows) if kind == "band" else 2 if name == "Diego Martins" or name == "Rafael Costa" else 1
        prepared = {
            "genre": canonical_genre(genre),
            "location": location,
            "price_mid": parse_price_midpoint(price),
            "members": members,
            "experience": experience,
            "rating": rating,
        }
        vector = np.array(ordered_vector(clustering_features(prepared), cluster_names), dtype=float)
        scaled = (vector - cluster_scaler.mean_) / np.where(
            cluster_scaler.scale_ == 0, 1.0, cluster_scaler.scale_
        )
        distances = np.linalg.norm(kmeans.cluster_centers_ - scaled, axis=1)
        cluster_id = int(np.argmin(distances))
        print(f"  {name}: {display_names[cluster_id]}")


def save_regression_plot(y_true, linear_pred, forest_pred) -> None:
    fig, ax = plt.subplots(figsize=(7, 6))
    ax.scatter(y_true, linear_pred, alpha=0.65, label="Regressão linear", color="#c2410c")
    ax.scatter(y_true, forest_pred, alpha=0.45, label="Random Forest", color="#1f2937")
    low = min(y_true.min(), linear_pred.min(), forest_pred.min())
    high = max(y_true.max(), linear_pred.max(), forest_pred.max())
    ax.plot([low, high], [low, high], color="#78716c", linewidth=1)
    ax.set_xlabel("Cachê observado (R$)")
    ax.set_ylabel("Cachê previsto (R$)")
    ax.set_title("Regressão do cachê — teste")
    ax.legend()
    fig.tight_layout()
    fig.savefig(FIGURES / "regressao_previsto_vs_real.png", dpi=140)
    plt.close(fig)


def save_confusion_plot(matrix: list[list[int]]) -> None:
    fig, ax = plt.subplots(figsize=(5.5, 4.5))
    image = ax.imshow(matrix, cmap="Oranges")
    ax.set_xticks([0, 1], ["Recusada", "Aceita"])
    ax.set_yticks([0, 1], ["Recusada", "Aceita"])
    ax.set_xlabel("Previsto")
    ax.set_ylabel("Real")
    ax.set_title("Classificação de aceite — teste")
    for row in range(2):
        for col in range(2):
            ax.text(col, row, str(matrix[row][col]), ha="center", va="center", color="#1c1917")
    fig.colorbar(image, ax=ax, fraction=0.046)
    fig.tight_layout()
    fig.savefig(FIGURES / "classificacao_matriz_confusao.png", dpi=140)
    plt.close(fig)


def save_cluster_plots(scaled, labels, silhouette_by_k, best_k, names) -> None:
    fig, ax = plt.subplots(figsize=(6.5, 4.2))
    ks = [int(key) for key in silhouette_by_k]
    scores = [silhouette_by_k[str(k)] for k in ks]
    colors = ["#c2410c" if k == best_k else "#d6d3d1" for k in ks]
    ax.bar([str(k) for k in ks], scores, color=colors)
    ax.set_xlabel("Número de grupos (k)")
    ax.set_ylabel("Silhueta")
    ax.set_title("Escolha de k no K-Means")
    fig.tight_layout()
    fig.savefig(FIGURES / "cluster_silhueta.png", dpi=140)
    plt.close(fig)

    pca = PCA(n_components=2, random_state=SEED)
    projected = pca.fit_transform(scaled)
    fig, ax = plt.subplots(figsize=(7, 5.5))
    palette = ["#c2410c", "#1d4ed8", "#15803d", "#a16207", "#7c3aed", "#0f766e"]
    for cluster_id, name in enumerate(names):
        mask = labels == cluster_id
        ax.scatter(
            projected[mask, 0],
            projected[mask, 1],
            s=28,
            alpha=0.8,
            color=palette[cluster_id % len(palette)],
            label=name,
        )
    ax.set_xlabel("Componente 1")
    ax.set_ylabel("Componente 2")
    ax.set_title("Talentos agrupados (projeção PCA)")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(FIGURES / "cluster_pca.png", dpi=140)
    plt.close(fig)


if __name__ == "__main__":
    main()
