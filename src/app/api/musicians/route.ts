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

    const musicians = await prisma.musician.findMany({
      orderBy: { rating: "desc" },
    });

    const filtered = musicians.filter((m) => {
      const matchesQuery =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        m.instruments.some((i) => i.toLowerCase().includes(query)) ||
        m.genres.some((g) => g.toLowerCase().includes(query));
      const matchesLocation =
        !location || location === "todas" || m.location.includes(location);
      const matchesGenre =
        !genre || genre === "todas" || m.genres.includes(genre);
      const matchesRating = m.rating >= minRating;
      return matchesQuery && matchesLocation && matchesGenre && matchesRating;
    });

    return NextResponse.json(filtered);
  } catch (error) {
    return handleApiError(error);
  }
}
