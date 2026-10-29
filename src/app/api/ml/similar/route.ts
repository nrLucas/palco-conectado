import { handleApiError } from "@/lib/auth/permissions";
import { loadTalentCatalog, talentHref, type TalentSnapshot } from "@/lib/ml/catalog";
import { assignCluster, distanceBetween } from "@/lib/ml/predict";
import { NextResponse } from "next/server";

function snapshotOf(talent: TalentSnapshot) {
  return {
    kind: talent.kind,
    id: talent.id,
    name: talent.name,
    genre: talent.genreLabel,
    location: talent.location,
    href: talentHref(talent),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind");
    const id = searchParams.get("id");

    if ((kind !== "band" && kind !== "musician") || !id) {
      return NextResponse.json({ error: "Informe kind e id" }, { status: 400 });
    }

    const catalog = await loadTalentCatalog();
    const scored = catalog.map((talent) => {
      const assignment = assignCluster(talent);
      return { talent, ...assignment };
    });

    const current = scored.find((item) => item.talent.kind === kind && item.talent.id === id);
    if (!current) {
      return NextResponse.json({ error: "Talento não encontrado" }, { status: 404 });
    }

    const similar = scored
      .filter(
        (item) =>
          item.clusterId === current.clusterId &&
          !(item.talent.kind === kind && item.talent.id === id),
      )
      .map((item) => ({
        profile: snapshotOf(item.talent),
        distance: distanceBetween(current.scaled, item.scaled),
      }))
      .sort(
        (left, right) =>
          left.distance - right.distance ||
          left.profile.name.localeCompare(right.profile.name, "pt-BR"),
      )
      .slice(0, 4)
      .map((item) => item.profile);

    return NextResponse.json({
      clusterId: current.clusterId,
      clusterName: current.clusterName,
      similar,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
