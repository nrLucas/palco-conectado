"""Gera propostas e talentos sintéticos no formato do schema do Palco.

Os preços seguem as faixas do seed (ponto médio de textos como
"R$ 600 - R$ 1.200"). O segmento latente dos talentos serve só para
avaliar o K-Means; ele não entra como feature.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from domain import (
    CITIES,
    ESTABLISHMENT_TYPES,
    GENRE_BONUS,
    GENRE_COMPATIBILITY,
    TYPE_BONUS,
    canonical_genre,
    experience_from_label,
    format_price_range,
    genre_match,
    is_weekend,
    lead_days,
    parse_price_midpoint,
    same_city,
)

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
SEED = 42
N_TALENTS = 180
N_PROPOSALS = 900

SEGMENTS = ("palco_bairro", "casa_noturna", "sala_intima")

SEGMENT_PROFILE = {
    "palco_bairro": {
        "genres": ["Samba", "MPB"],
        "city": "Rio de Janeiro - RJ",
        "price": (420, 780),
        "members": (4, 6),
    },
    "casa_noturna": {
        "genres": ["Rock", "Eletronica", "Pop"],
        "city": "São Paulo - SP",
        "price": (1100, 1900),
        "members": (3, 5),
    },
    "sala_intima": {
        "genres": ["Jazz", "Blues"],
        "city": "Belo Horizonte - MG",
        "price": (780, 1350),
        "members": (2, 3),
    },
}

EXPERIENCE_LABELS = ("iniciante", "intermediario", "profissional")


def fair_price(row: dict) -> float:
    genre = row["genre"]
    interaction = 0.9 * row["capacity"] if genre in ("Eletronica", "Sertanejo") else 0.0
    return (
        250
        + 1.6 * row["capacity"]
        + 75 * row["members"]
        + 130 * row["experience"]
        + (200 if row["is_weekend"] else 0)
        - (90 if row["same_city"] else 0)
        + 80 * (row["rating"] - 4)
        + 2.0 * row["shows"]
        + 0.28 * row["talent_price_mid"]
        + 0.18 * row["venue_budget_mid"]
        + GENRE_BONUS[genre]
        + TYPE_BONUS[row["establishment_type"]]
        + interaction
    )


def acceptance_probability(row: dict, amount: float, fair: float) -> float:
    ratio = amount / max(fair, 1.0)
    gap = abs(ratio - 1.05)
    logit = (
        0.35
        - 4.6 * gap
        + 1.55 * row["genre_match"]
        + 0.75 * row["same_city"]
        + 0.3 * row["experience"]
        + 0.016 * min(row["lead_days"], 30)
    )
    return float(1 / (1 + np.exp(-logit)))


def build_talents(rng: np.random.Generator) -> pd.DataFrame:
    rows = []
    for index in range(N_TALENTS):
        segment = SEGMENTS[index % len(SEGMENTS)]
        profile = SEGMENT_PROFILE[segment]
        kind = "musician" if rng.random() < 0.28 else "band"
        genre = profile["genres"][int(rng.integers(0, len(profile["genres"])))]
        city = profile["city"]
        price_low, price_high = profile["price"]
        member_low, member_high = profile["members"]

        if kind == "musician":
            members = 1
            low = int(rng.integers(price_low, price_high) * rng.uniform(0.72, 1.0))
            experience = int(rng.choice([1, 2, 2]))
            shows = int(rng.integers(8, 60))
        else:
            members = int(rng.integers(member_low, member_high + 1))
            low = int(rng.integers(price_low, price_high))
            experience = int(rng.choice([1, 2, 2, 0]))
            shows = int(rng.integers(8, 55))
        high = low + int(rng.integers(180, 420))

        rating = float(np.clip(rng.normal(4.6, 0.15), 4.0, 5.0))
        price_text = format_price_range(low, high)
        rows.append(
            {
                "talent_id": f"t{index:04d}",
                "kind": kind,
                "name": f"Talento {index + 1}",
                "segment": segment,
                "genre_raw": genre,
                "genre": canonical_genre(genre),
                "location": city,
                "members": members,
                "experience": experience,
                "experience_label": EXPERIENCE_LABELS[experience],
                "rating": round(rating, 2),
                "shows": shows,
                "price_text": price_text,
                "price_mid": round(parse_price_midpoint(price_text), 2),
            }
        )
    return pd.DataFrame(rows)


def build_proposals(rng: np.random.Generator, talents: pd.DataFrame) -> pd.DataFrame:
    rows = []
    origin = np.datetime64("2025-03-01")
    for index in range(N_PROPOSALS):
        talent = talents.iloc[int(rng.integers(0, len(talents)))]
        establishment_type = ESTABLISHMENT_TYPES[int(rng.integers(0, len(ESTABLISHMENT_TYPES)))]
        venue_city = CITIES[int(rng.integers(0, len(CITIES)))]
        if rng.random() < 0.42:
            venue_city = talent.location

        if establishment_type == "Restaurante":
            capacity = int(rng.integers(40, 130))
            budget_low = int(rng.integers(500, 900))
        elif establishment_type == "Bar":
            capacity = int(rng.integers(70, 180))
            budget_low = int(rng.integers(600, 1100))
        elif establishment_type == "Pub":
            capacity = int(rng.integers(90, 230))
            budget_low = int(rng.integers(750, 1300))
        elif establishment_type == "Casa noturna":
            capacity = int(rng.integers(140, 420))
            budget_low = int(rng.integers(1100, 2000))
        else:
            capacity = int(rng.integers(180, 700))
            budget_low = int(rng.integers(1400, 2800))
        budget_high = budget_low + int(rng.integers(250, 900))
        budget_text = format_price_range(budget_low, budget_high)

        created = origin + np.timedelta64(int(rng.integers(0, 420)), "D")
        created_py = created.astype("datetime64[D]").item()
        ahead = int(rng.integers(3, 76))
        event = created_py.fromordinal(created_py.toordinal() + ahead)
        created_iso = str(created_py)
        event_iso = event.isoformat()

        row = {
            "proposal_id": f"p{index:04d}",
            "talent_id": talent.talent_id,
            "segment": talent.segment,
            "genre_raw": talent.genre_raw,
            "genre": talent.genre,
            "establishment_type": establishment_type,
            "capacity": capacity,
            "members": int(talent.members),
            "experience": int(talent.experience),
            "talent_location": talent.location,
            "venue_location": venue_city,
            "same_city": same_city(talent.location, venue_city),
            "event_date": event_iso,
            "created_at": created_iso,
            "rating": float(talent.rating),
            "shows": int(talent.shows),
            "talent_price_text": talent.price_text,
            "venue_budget_text": budget_text,
            "talent_price_mid": float(talent.price_mid),
            "venue_budget_mid": round(parse_price_midpoint(budget_text), 2),
            "is_weekend": is_weekend(event_iso),
            "lead_days": lead_days(event_iso, created_iso),
        }
        row["genre_match"] = genre_match(row["genre"], establishment_type)
        fair = fair_price(row)
        amount = max(200.0, fair + float(rng.normal(0, 140)))
        roll = float(rng.random())
        if roll < 0.36:
            factor = float(rng.uniform(0.4, 0.82))
        elif roll < 0.72:
            factor = float(rng.uniform(0.9, 1.22))
        else:
            factor = float(rng.uniform(1.4, 1.9))
        offered = max(200.0, fair * factor)
        probability = acceptance_probability(row, offered, fair)
        accepted = int(rng.random() < probability)
        row["fair_price"] = round(fair, 2)
        row["amount"] = round(offered, 2)
        row["observed_cache"] = round(amount, 2)
        row["accepted"] = accepted
        rows.append(row)

    frame = pd.DataFrame(rows)
    # A regressão aprende o cachê observado (fair + ruído), não o valor ofertado.
    frame["amount_target"] = frame["observed_cache"]
    return frame


def main() -> None:
    rng = np.random.default_rng(SEED)
    DATA.mkdir(parents=True, exist_ok=True)
    talents = build_talents(rng)
    proposals = build_proposals(rng, talents)

    # Confere o parser de preço do seed real.
    seed_mid = parse_price_midpoint("R$ 600 - R$ 1.200")
    if abs(seed_mid - 900) > 0.01:
        raise SystemExit(f"parser de preço inesperado: {seed_mid}")
    if experience_from_label("profissional") != 2:
        raise SystemExit("rótulo de experiência inesperado")
    unused = GENRE_COMPATIBILITY["Bar"]
    if "Jazz" in unused:
        raise SystemExit("compatibilidade de gênero inconsistente")

    talents.to_csv(DATA / "talents.csv", index=False)
    proposals.to_csv(DATA / "proposals.csv", index=False)
    balance = proposals["accepted"].mean()
    print(f"talentos: {len(talents)} | propostas: {len(proposals)} | aceite: {balance:.2%}")
    print(f"arquivos em {DATA}")


if __name__ == "__main__":
    main()
