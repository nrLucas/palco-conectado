import { handleApiError } from "@/lib/auth/permissions";
import { recommendForBand, recommendForEstablishment } from "@/lib/ml/recommend";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind");
    const id = searchParams.get("id");

    if ((kind !== "band" && kind !== "establishment") || !id) {
      return NextResponse.json({ error: "Informe kind e id" }, { status: 400 });
    }

    const result =
      kind === "band" ? await recommendForBand(id) : await recommendForEstablishment(id);

    if (!result) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
