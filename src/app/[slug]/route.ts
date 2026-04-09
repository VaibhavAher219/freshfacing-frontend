import { NextRequest, NextResponse } from "next/server";

// GET freshfacing.com/hammond → proxies https://freshfacing-hammond.pages.dev
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Only allow slug characters that the pipeline would produce
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || "https://xfshkmpmdvfnphtornwe.supabase.co";
  const storageUrl = `${supabaseUrl}/storage/v1/object/public/site-html/${slug}.html`;

  try {
    const resp = await fetch(storageUrl, {
      headers: { "User-Agent": "FreshFacing-Proxy/1.0" },
      next: { revalidate: 3600 },
    });

    if (!resp.ok) {
      return new NextResponse("Site not found", { status: 404 });
    }

    const html = await resp.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return new NextResponse("Site not found", { status: 404 });
  }
}
