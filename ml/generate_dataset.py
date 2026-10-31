"""Gera propostas e talentos sintéticos no formato do schema do Palco.

Os preços seguem as faixas do seed (ponto médio de textos como
"R$ 600 - R$ 1.200"). O segmento latente dos talentos serve só para
avaliar o K-Means; ele não entra como feature.

Nomes, gêneros e popularidade podem vir de ml/data/spotify_artists.json.
Integrantes, cachê, orçamento e aceite continuam simulados.
"""

from __future__ import annotations

import json
import math
from datetime import date, timedelta
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
    day_flags,
    experience_from_label,
    fold,
    format_price_range,
    genre_match,
    lead_days,
    parse_price_midpoint,
    same_city,
)

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
SEED = 42
N_TALENTS = 800
N_PROPOSALS = 6000
N_VENUES = 36

SEGMENTS = ("palco_bairro", "casa_noturna", "sala_intima")

SEGMENT_PROFILE = {
    "palco_bairro": {
        "genres": ["Samba", "MPB", "Forro"],
        "city": "Rio de Janeiro - RJ",
        "price": (420, 780),
        "members": (4, 6),
    },
    "casa_noturna": {
        "genres": ["Rock", "Eletronica", "Pop", "Sertanejo"],
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

SEGMENT_BY_GENRE = {
    "Samba": "palco_bairro",
    "MPB": "palco_bairro",
    "Forro": "palco_bairro",
    "Rock": "casa_noturna",
    "Eletronica": "casa_noturna",
    "Pop": "casa_noturna",
    "Sertanejo": "casa_noturna",
    "Jazz": "sala_intima",
    "Blues": "sala_intima",
}

EXPERIENCE_LABELS = ("iniciante", "intermediario", "profissional")

DAY_PREMIUM = {"is_friday": 160, "is_saturday": 420, "is_sunday": 280}


def fair_price(row: dict) -> float:
    genre = row["genre"]
    interaction = 0.9 * row["capacity"] if genre in ("Eletronica", "Sertanejo") else 0.0
    premium = 0
    for flag, extra in DAY_PREMIUM.items():
        if row.get(flag):
            premium = extra
            break
    return (
        250
        + 1.6 * row["capacity"]
        + 75 * row["members"]
        + 130 * row["experience"]
        + premium
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
    offer_signal = math.log(max(ratio, 0.2))
    load = min(int(row["date_load"]), 5)
    logit = (
        0.85
        + 2.6 * offer_signal
        + 1.15 * row["genre_match"]
        + 0.5 * row["same_city"]
        + 0.22 * row["experience"]
        + 0.01 * min(row["lead_days"], 30)
        - 0.72 * load
    )
    return float(1 / (1 + np.exp(-logit)))


def load_spotify_artists() -> list[dict]:
    path = DATA / "spotify_artists.json"
    if not path.exists():
        return []
    payload = json.loads(path.read_text(encoding="utf-8"))
    usable = []
    seen = set()
    for artist in payload.get("artists") or []:
        genre = canonical_genre(artist.get("genres") or [])
        name = str(artist.get("name") or "").strip()
        key = fold(name)
        if not name or not genre or key in seen:
            continue
        seen.add(key)
        usable.append(
            {
                "name": name,
                "genre": genre,
                "popularity": artist.get("popularity") or None,
            }
        )
    return usable


def build_talents(rng: np.random.Generator) -> tuple[pd.DataFrame, int]:
    artists = load_spotify_artists()
    rows = []
    used = 0
    for index in range(N_TALENTS):
        artist = artists[index] if index < len(artists) else None
        if artist:
            used += 1
            genre = artist["genre"]
            segment = SEGMENT_BY_GENRE[genre]
            name = artist["name"]
            name_source = "spotify"
            popularity = artist["popularity"] if artist["popularity"] else int(rng.integers(35, 85))
        else:
            segment = SEGMENTS[index % len(SEGMENTS)]
            profile = SEGMENT_PROFILE[segment]
            genre = profile["genres"][int(rng.integers(0, len(profile["genres"])))]
            name = f"Talento {index + 1}"
            name_source = "sintetico"
            popularity = int(rng.integers(20, 70))

        profile = SEGMENT_PROFILE[segment]
        kind = "musician" if rng.random() < 0.28 else "band"
        city = profile["city"]
        if rng.random() < 0.35:
            city = CITIES[int(rng.integers(0, len(CITIES)))]
        price_low, price_high = profile["price"]
        member_low, member_high = profile["members"]

        if kind == "musician":
            members = 1
            low = int(rng.integers(price_low, price_high) * rng.uniform(0.72, 1.0))
            experience = int(rng.choice([1, 2, 2]))
            shows = int(np.clip(8 + popularity * 0.5 + rng.normal(0, 6), 4, 90))
        else:
            members = int(rng.integers(member_low, member_high + 1))
            low = int(rng.integers(price_low, price_high))
            experience = int(rng.choice([1, 2, 2, 0]))
            shows = int(np.clip(6 + popularity * 0.45 + rng.normal(0, 8), 4, 80))
        high = low + int(rng.integers(180, 420))
        rating = float(np.clip(4.05 + popularity / 180 + rng.normal(0, 0.08), 4.0, 5.0))
        price_text = format_price_range(low, high)
        rows.append(
            {
                "talent_id": f"t{index:04d}",
                "kind": kind,
                "name": name,
                "name_source": name_source,
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
                "spotify_popularity": popularity if artist else "",
            }
        )
    return pd.DataFrame(rows), used


def event_dates() -> list[date]:
    dates: list[date] = []
    cursor = date(2025, 6, 6)
    while len(dates) < 40:
        dates.append(cursor)
        dates.append(cursor + timedelta(days=1))
        dates.append(cursor + timedelta(days=2))
        if len(dates) % 8 == 0:
            dates.append(cursor - timedelta(days=1))
        cursor += timedelta(days=7)
    return dates[:40]


def build_venues(rng: np.random.Generator) -> list[dict]:
    venues = []
    for index in range(N_VENUES):
        establishment_type = ESTABLISHMENT_TYPES[int(rng.integers(0, len(ESTABLISHMENT_TYPES)))]
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
        venues.append(
            {
                "venue_id": f"v{index:04d}",
                "establishment_type": establishment_type,
                "city": CITIES[int(rng.integers(0, len(CITIES)))],
                "capacity": capacity,
                "budget_text": format_price_range(budget_low, budget_high),
            }
        )
    return venues


def offer_factor(rng: np.random.Generator) -> float:
    roll = float(rng.random())
    if roll < 0.28:
        return float(rng.uniform(0.35, 0.85))
    if roll < 0.62:
        return float(rng.uniform(0.9, 1.35))
    if roll < 0.88:
        return float(rng.uniform(1.5, 3.5))
    return float(rng.uniform(4.0, 20.0))


def build_proposals(rng: np.random.Generator, talents: pd.DataFrame) -> pd.DataFrame:
    venues = build_venues(rng)
    calendar = event_dates()
    occupancy: dict[tuple[str, str], int] = {}
    rows = []
    for index in range(N_PROPOSALS):
        talent = talents.iloc[int(rng.integers(0, len(talents)))]
        venue = venues[int(rng.integers(0, len(venues)))]
        venue_city = venue["city"]
        if rng.random() < 0.42:
            venue_city = str(talent.location)
        event = calendar[int(rng.integers(0, len(calendar)))]
        event_iso = event.isoformat()
        key = (venue["venue_id"], event_iso)
        load = min(occupancy.get(key, 0), 5)
        occupancy[key] = occupancy.get(key, 0) + 1

        ahead = int(rng.integers(3, 76))
        created = event - timedelta(days=ahead)
        created_iso = created.isoformat()
        flags = day_flags(event_iso)
        budget_text = venue["budget_text"]
        row = {
            "proposal_id": f"p{index:05d}",
            "talent_id": talent.talent_id,
            "venue_id": venue["venue_id"],
            "segment": talent.segment,
            "genre_raw": talent.genre_raw,
            "genre": talent.genre,
            "establishment_type": venue["establishment_type"],
            "capacity": venue["capacity"],
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
            "lead_days": lead_days(event_iso, created_iso),
            "date_load": load,
            **flags,
        }
        row["genre_match"] = genre_match(row["genre"], venue["establishment_type"])
        fair = fair_price(row)
        observed = max(200.0, fair + float(rng.normal(0, 140)))
        offered = max(200.0, fair * offer_factor(rng))
        probability = acceptance_probability(row, offered, fair)
        row["fair_price"] = round(fair, 2)
        row["amount"] = round(offered, 2)
        row["observed_cache"] = round(observed, 2)
        row["accepted"] = int(rng.random() < probability)
        rows.append(row)

    frame = pd.DataFrame(rows)
    frame["amount_target"] = frame["observed_cache"]
    return frame


def main() -> None:
    rng = np.random.default_rng(SEED)
    DATA.mkdir(parents=True, exist_ok=True)
    talents, spotify_used = build_talents(rng)
    proposals = build_proposals(rng, talents)

    seed_mid = parse_price_midpoint("R$ 600 - R$ 1.200")
    if abs(seed_mid - 900) > 0.01:
        raise SystemExit(f"parser de preço inesperado: {seed_mid}")
    if experience_from_label("profissional") != 2:
        raise SystemExit("rótulo de experiência inesperado")
    if "Jazz" in GENRE_COMPATIBILITY["Bar"]:
        raise SystemExit("compatibilidade de gênero inconsistente")
    if proposals["is_saturday"].sum() == 0 or proposals["is_sunday"].sum() == 0:
        raise SystemExit("o calendário não gerou sábado ou domingo")

    talents.to_csv(DATA / "talents.csv", index=False)
    proposals.to_csv(DATA / "proposals.csv", index=False)
    meta = {
        "seed": SEED,
        "talents": int(len(talents)),
        "proposals": int(len(proposals)),
        "spotifyArtistsUsed": int(spotify_used),
    }
    (DATA / "dataset_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    balance = proposals["accepted"].mean()
    print(
        f"talentos: {len(talents)} | propostas: {len(proposals)} | "
        f"aceite: {balance:.2%} | nomes do Spotify: {spotify_used}"
    )
    print(f"arquivos em {DATA}")


if __name__ == "__main__":
    main()
