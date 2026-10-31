"""Busca artistas no Spotify e grava ml/data/spotify_artists.json.

Lê SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET de .env.local.
A API traz nome, gêneros e popularidade. Não traz integrantes, cachê nem aceite.
Sem token, o script termina sem gravar e o gerador segue só com talentos sintéticos.
"""

from __future__ import annotations

import base64
import json
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from domain import fold

ROOT = Path(__file__).resolve().parent
ENV_FILE = ROOT.parent / ".env.local"
OUT = ROOT / "data" / "spotify_artists.json"

QUERIES = {
    "mpb": "mpb",
    "samba": "samba",
    "pagode": "pagode",
    "sertanejo": "sertanejo",
    "forro": "forro",
    "axe": "pop",
    "bossa nova": "mpb",
    "rock brasil": "rock",
    "funk carioca": "pop",
    "jazz brasil": "jazz",
    "anitta": "pop",
    "legiao urbana": "rock",
    "gilberto gil": "mpb",
    "djavan": "mpb",
    "alok": "eletronica",
}


def read_env(name: str) -> str:
    if not ENV_FILE.exists():
        return ""
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        if key.strip() == name:
            return value.strip().strip('"').strip("'")
    return ""


def request_json(url: str, headers: dict[str, str], data: bytes | None = None) -> dict:
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def token(client_id: str, client_secret: str) -> str:
    raw = f"{client_id}:{client_secret}".encode("utf-8")
    basic = base64.b64encode(raw).decode("ascii")
    body = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode("utf-8")
    payload = request_json(
        "https://accounts.spotify.com/api/token",
        {"Authorization": f"Basic {basic}", "Content-Type": "application/x-www-form-urlencoded"},
        body,
    )
    return str(payload["access_token"])


def search_artists(access: str, query: str) -> list[dict]:
    found = []
    for offset in (0, 10, 20, 30):
        params = urllib.parse.urlencode(
            {"q": query, "type": "artist", "limit": 10, "offset": offset}
        )
        try:
            payload = request_json(
                f"https://api.spotify.com/v1/search?{params}",
                {"Authorization": f"Bearer {access}"},
            )
        except urllib.error.HTTPError:
            break
        found.extend(payload.get("artists", {}).get("items", []) or [])
    return found


def main() -> None:
    client_id = read_env("SPOTIFY_CLIENT_ID")
    client_secret = read_env("SPOTIFY_CLIENT_SECRET")
    if not client_id or not client_secret:
        print("Spotify sem credencial em .env.local. O gerador segue sintético.")
        return

    try:
        access = token(client_id, client_secret)
    except (urllib.error.URLError, KeyError, TimeoutError) as error:
        print(f"Spotify indisponível ({error}). O gerador segue sintético.")
        return

    found: dict[str, dict] = {}
    for query, label in QUERIES.items():
        try:
            items = search_artists(access, query)
        except (urllib.error.URLError, TimeoutError) as error:
            print(f"busca falhou para {query}: {error}")
            continue
        for artist in items:
            artist_id = artist.get("id")
            name = (artist.get("name") or "").strip()
            if not artist_id or not name:
                continue
            exact = fold(query) == fold(name)
            if artist_id in found and not exact:
                continue
            genres = artist.get("genres") or []
            found[artist_id] = {
                "id": artist_id,
                "name": name,
                "genres": genres or [label],
                "popularity": artist.get("popularity"),
                "genre_source": "artista" if genres else "busca",
            }

    if not found:
        print("Spotify não devolveu artistas. O gerador segue sintético.")
        return

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps({"source": "spotify", "artists": list(found.values())}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"artistas do Spotify: {len(found)} em {OUT}")


if __name__ == "__main__":
    main()
