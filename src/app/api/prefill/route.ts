import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url") || "";
  if (!raw) return NextResponse.json({ name: "" });

  const url = raw.startsWith("http") ? raw : "https://" + raw;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FreshFacing/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();

    // Try og:site_name first, then og:title, then <title>
    const ogSite =
      html.match(
        /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
      )?.[1] ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i,
      )?.[1];
    const ogTitle =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      )?.[1] ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      )?.[1];
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

    const raw_name = ogSite || ogTitle || title || "";
    // Strip common suffixes like " | Home", " - Official Site", etc.
    const name = raw_name.replace(/\s*[|\-–—]\s*.{0,40}$/, "").trim();

    return NextResponse.json({ name });
  } catch {
    return NextResponse.json({ name: "" });
  }
}
