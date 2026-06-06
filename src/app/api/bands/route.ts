import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase();
    const location = searchParams.get("location");
    const genre = searchParams.get("genre");
    const minRating = parseFloat(searchParams.get("minRating") || "0");

    const bands = await prisma.band.findMany({
      orderBy: { rating: "desc" },
    });

    const filtered = bands.filter((b) => {
      const matchesQuery =
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.location.toLowerCase().includes(query) ||
        b.genre.toLowerCase().includes(query);
      const matchesLocation =
        !location || location === "todas" || b.location.includes(location);
      const matchesGenre =
        !genre || genre === "todas" || b.genre.includes(genre);
      const matchesRating = b.rating >= minRating;
      return matchesQuery && matchesLocation && matchesGenre && matchesRating;
    });

    const profiles = await prisma.profile.findMany({
      where: {
        type: "banda",
        entityId: { in: filtered.map((b) => b.id) },
      },
      select: { id: true, entityId: true },
    });
    const profileByEntity = Object.fromEntries(
      profiles.map((p) => [p.entityId, p.id]),
    );

    return NextResponse.json(
      filtered.map((b) => ({ ...b, profileId: profileByEntity[b.id] ?? null })),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
