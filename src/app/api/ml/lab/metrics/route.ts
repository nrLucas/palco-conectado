import { LAB_FIGURES, LAB_FILES, labFilePath, labOptions } from "@/lib/ml/lab-files";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

export async function GET() {
  const raw = await readFile(labFilePath("metrics.json"), "utf8");
  return NextResponse.json({
    metrics: JSON.parse(raw),
    files: Object.keys(LAB_FILES),
    figures: Object.entries(LAB_FIGURES).map(([name, figure]) => ({
      name,
      title: figure.title,
      caption: figure.caption,
    })),
    options: labOptions,
  });
}
