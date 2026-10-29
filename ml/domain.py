"""Vocabulário e features compartilhados com a inferência em TypeScript.

O histórico de treino é sintético. As regras daqui precisam permanecer iguais
a src/lib/ml/features.ts: normalização de texto, ponto médio de preço,
experiência da banda e a ordem lógica das colunas.
"""

from __future__ import annotations

import re
import unicodedata
from datetime import date, datetime

GENRES = [
    "Rock",
    "Samba",
    "Jazz",
    "MPB",
    "Eletronica",
    "Pop",
    "Blues",
    "Forro",
    "Sertanejo",
]
GENRE_REFERENCE = "Rock"

ESTABLISHMENT_TYPES = ["Bar", "Restaurante", "Pub", "Casa noturna", "Evento"]
TYPE_REFERENCE = "Bar"

CITIES = [
    "São Paulo - SP",
    "Rio de Janeiro - RJ",
    "Belo Horizonte - MG",
    "Curitiba - PR",
    "Florianópolis - SC",
    "Salvador - BA",
    "Recife - PE",
    "Porto Alegre - RS",
]

# Sexta, sábado e domingo (segunda = 0, no padrão datetime.weekday).
WEEKEND_FROM_WEEKDAY = 4
BAND_EXPERIENCE_CUTS = (15, 40)

GENRE_BONUS = {
    "Rock": 0,
    "Samba": -80,
    "Jazz": 180,
    "MPB": -120,
    "Eletronica": 320,
    "Pop": 40,
    "Blues": 60,
    "Forro": -40,
    "Sertanejo": 100,
}

TYPE_BONUS = {
    "Bar": 0,
    "Restaurante": -70,
    "Pub": 80,
    "Casa noturna": 220,
    "Evento": 350,
}

GENRE_COMPATIBILITY: dict[str, set[str]] = {
    "Bar": {"Rock", "Pop", "Samba", "Sertanejo"},
    "Restaurante": {"Jazz", "MPB", "Blues"},
    "Pub": {"Rock", "Samba", "Pop", "Sertanejo", "Forro"},
    "Casa noturna": {"Eletronica", "Pop", "Rock"},
    "Evento": {"Sertanejo", "Pop", "Forro", "Samba", "Rock"},
}

_GENRE_RULES = (
    ("eletr", "Eletronica"),
    ("sertanej", "Sertanejo"),
    ("forro", "Forro"),
    ("pagode", "Samba"),
    ("samba", "Samba"),
    ("jazz", "Jazz"),
    ("blues", "Blues"),
    ("mpb", "MPB"),
    ("indie", "Rock"),
    ("rock", "Rock"),
    ("pop", "Pop"),
)


def fold(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value or "")
    stripped = "".join(
        char for char in decomposed if unicodedata.category(char) != "Mn"
    )
    return stripped.lower().strip()


def city_slug(city: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", fold(city)).strip("_")
    return slug


CITY_SLUGS = [city_slug(city) for city in CITIES]


def parse_price_midpoint(text: str | None) -> float:
    if not text:
        return 0.0
    numbers = re.findall(r"\d{1,3}(?:\.\d{3})+|\d+", text)
    values = [float(number.replace(".", "")) for number in numbers]
    if not values:
        return 0.0
    return sum(values) / len(values)


def format_brl_int(value: int) -> str:
    return f"{int(value):,}".replace(",", ".")


def format_price_range(low: int, high: int) -> str:
    return f"R$ {format_brl_int(low)} - R$ {format_brl_int(high)}"


def canonical_genre(value: str | list[str] | None) -> str | None:
    if value is None:
        return None
    tokens = value if isinstance(value, list) else re.split(r"[,/]", value)
    for token in tokens:
        folded = fold(token)
        for needle, genre in _GENRE_RULES:
            if needle in folded:
                return genre
    return None


def experience_from_shows(shows: int) -> int:
    low, high = BAND_EXPERIENCE_CUTS
    if shows < low:
        return 0
    if shows < high:
        return 1
    return 2


def experience_from_label(label: str | None) -> int:
    folded = fold(label or "")
    if folded.startswith("inic"):
        return 0
    if folded.startswith("inter"):
        return 1
    if folded.startswith("prof"):
        return 2
    return 1


def same_city(left: str | None, right: str | None) -> int:
    if not left or not right:
        return 0
    return int(fold(left) == fold(right))


def parse_iso_date(value: str) -> date:
    raw = value[:10]
    return datetime.strptime(raw, "%Y-%m-%d").date()


def weekday_monday0(value: str) -> int:
    return parse_iso_date(value).weekday()


def is_weekend(value: str) -> int:
    return int(weekday_monday0(value) >= WEEKEND_FROM_WEEKDAY)


def lead_days(event_date: str, as_of: str) -> int:
    delta = (parse_iso_date(event_date) - parse_iso_date(as_of)).days
    return max(0, delta)


def genre_match(genre: str | None, establishment_type: str | None) -> int:
    allowed = GENRE_COMPATIBILITY.get(establishment_type or "", set())
    return int(genre in allowed) if genre else 0


def regression_feature_names() -> list[str]:
    names = [
        "capacity",
        "members",
        "experience",
        "same_city",
        "is_weekend",
        "rating",
        "shows",
        "talent_price_mid",
        "venue_budget_mid",
    ]
    names.extend(f"genre_{genre}" for genre in GENRES if genre != GENRE_REFERENCE)
    names.extend(
        f"type_{kind}" for kind in ESTABLISHMENT_TYPES if kind != TYPE_REFERENCE
    )
    return names


def classification_feature_names() -> list[str]:
    return [
        "amount_ratio",
        "ratio_gap",
        "genre_match",
        "capacity",
        "experience",
        "same_city",
        "lead_days",
        "rating",
    ]


def clustering_feature_names() -> list[str]:
    names = ["price_mid", "members", "experience", "rating"]
    names.extend(f"genre_{genre}" for genre in GENRES)
    names.extend(f"city_{slug}" for slug in CITY_SLUGS)
    return names


def regression_features(row: dict) -> dict[str, float]:
    genre = row.get("genre") or canonical_genre(row.get("genre_raw"))
    features = {
        "capacity": float(row["capacity"]),
        "members": float(row["members"]),
        "experience": float(row["experience"]),
        "same_city": float(row["same_city"]),
        "is_weekend": float(row["is_weekend"]),
        "rating": float(row["rating"]),
        "shows": float(row["shows"]),
        "talent_price_mid": float(row["talent_price_mid"]),
        "venue_budget_mid": float(row["venue_budget_mid"]),
    }
    for name in GENRES:
        if name == GENRE_REFERENCE:
            continue
        features[f"genre_{name}"] = 1.0 if genre == name else 0.0
    establishment_type = row.get("establishment_type")
    for name in ESTABLISHMENT_TYPES:
        if name == TYPE_REFERENCE:
            continue
        features[f"type_{name}"] = 1.0 if establishment_type == name else 0.0
    return features


def classification_features(row: dict) -> dict[str, float]:
    suggested = float(row["suggested_amount"])
    amount = float(row["amount"])
    ratio = amount / max(suggested, 1.0)
    return {
        "amount_ratio": ratio,
        "ratio_gap": abs(ratio - 1.05),
        "genre_match": float(row["genre_match"]),
        "capacity": float(row["capacity"]),
        "experience": float(row["experience"]),
        "same_city": float(row["same_city"]),
        "lead_days": float(row["lead_days"]),
        "rating": float(row["rating"]),
    }


def clustering_features(row: dict) -> dict[str, float]:
    genre = row.get("genre") or canonical_genre(row.get("genre_raw"))
    slug = city_slug(row.get("location") or "")
    features = {
        "price_mid": float(row["price_mid"]),
        "members": float(row["members"]),
        "experience": float(row["experience"]),
        "rating": float(row["rating"]),
    }
    for name in GENRES:
        features[f"genre_{name}"] = 1.0 if genre == name else 0.0
    for city_name in CITY_SLUGS:
        features[f"city_{city_name}"] = 1.0 if slug == city_name else 0.0
    return features


def ordered_vector(features: dict[str, float], names: list[str]) -> list[float]:
    return [float(features[name]) for name in names]
