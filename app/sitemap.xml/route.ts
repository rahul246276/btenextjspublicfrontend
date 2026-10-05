import { apiEndpoint } from "@/lib/packages";

const BACKEND_SITEMAP_URL = apiEndpoint("/api/v1/seo/sitemap.xml");
const CANONICAL_SITE_URL = "https://bablonstravelent.com";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(BACKEND_SITEMAP_URL, { cache: "no-store" });
    if (!response.ok) {
      console.error("Backend sitemap failed:", response.status);
      return new Response("Sitemap unavailable", {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    const xml = await response.text();
    const locations = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => match[1].trim());
    const hasOnlyCanonicalUrls = locations.length > 0 && locations.every((location) => {
      try {
        const url = new URL(location.replace(/&amp;/g, "&"));
        return url.origin === CANONICAL_SITE_URL && !url.search && !url.hash && !url.username && !url.password;
      } catch {
        return false;
      }
    });

    if (!response.headers.get("content-type")?.toLowerCase().includes("xml") || !/<urlset(?:\s|>)/i.test(xml) || !hasOnlyCanonicalUrls) {
      console.error("Backend sitemap returned invalid XML or non-canonical URLs");
      return new Response("Sitemap unavailable", {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Backend sitemap request failed:", error instanceof Error ? error.message : "Unknown error");
    return new Response("Sitemap unavailable", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
