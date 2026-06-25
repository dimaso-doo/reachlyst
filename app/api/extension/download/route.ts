import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  const file = await readFile(path.join(process.cwd(), "public", "reachlyst-extension.zip"));

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": "attachment; filename=\"reachlyst-extension.zip\"",
      "Content-Type": "application/zip",
      "Content-Length": String(file.byteLength)
    }
  });
}
