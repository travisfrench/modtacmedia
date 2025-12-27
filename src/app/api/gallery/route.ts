import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

export async function GET() {
  const dir = path.join(process.cwd(), "public", "media", "gallery");

  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    // If folder doesn't exist or can't be read, return empty list (safe)
    return NextResponse.json({ images: [] });
  }

  const images = files
    .filter((f) => ALLOWED.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => `/media/gallery/${encodeURIComponent(f)}`);

  return NextResponse.json({ images });
}
