import { isLabFigureName, labFigurePath } from "@/lib/ml/lab-files";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!isLabFigureName(name)) {
    return NextResponse.json({ error: "Figura não encontrada" }, { status: 404 });
  }

  const bytes = await readFile(labFigurePath(name));
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
