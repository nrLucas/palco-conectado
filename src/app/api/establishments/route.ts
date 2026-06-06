import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase();
    const location = searchParams.get("location");
    const type = searchParams.get("type");
    const minRating = parseFloat(searchParams.get("minRating") || "0");

    const establishments = await prisma.establishment.findMany({
      orderBy: { rating: "desc" },
    });

    const filtered = establishments.filter((e) => {
      const matchesQuery =
        !query ||
        e.name.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query);
      const matchesLocation =
        !location || location === "todas" || e.location.includes(location);
      const matchesType = !type || type === "todas" || e.type.includes(type);
      const matchesRating = e.rating >= minRating;
      return matchesQuery && matchesLocation && matchesType && matchesRating;
    });

    const profiles = await prisma.profile.findMany({
      where: {
        type: "contratante",
        entityId: { in: filtered.map((e) => e.id) },
      },
      select: { id: true, entityId: true },
    });
    const profileByEntity = Object.fromEntries(
      profiles.map((p) => [p.entityId, p.id]),
    );

    return NextResponse.json(
      filtered.map((e) => ({ ...e, profileId: profileByEntity[e.id] ?? null })),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
