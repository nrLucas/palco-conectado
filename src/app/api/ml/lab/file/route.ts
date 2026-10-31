import { isLabDataFile, isLabFileName, labFilePath } from "@/lib/ml/lab-files";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!isLabFileName(name)) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  const raw = await readFile(labFilePath(name), "utf8");
  const download = searchParams.get("download") === "1";
  const contentType = isLabDataFile(name) ? "text/csv; charset=utf-8" : "application/json; charset=utf-8";
  return new NextResponse(raw, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
    },
  });
}
