import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { faqPageConfigs } from "@/legacy/src/pages/FAQ/faqContent";
import LegacyPublicApp from "@/app/legacy-public-client";

const SITE_URL = "https://bablonstravelent.com";
const staticSeo: Record<string, { title: string; description: string }> = {
  "/gallery": { title: "Travel Gallery | Real Trips, Real Travelers", description: "See travel moments from Bablons Travel customers and find inspiration for your next international trip." },
  "/about": { title: "About Bablons Travel & Entertainment", description: "Learn about Bablons Travel, our travel expertise, and customized holiday planning services." },
  "/contact": { title: "Contact Bablons Travel", description: "Contact Bablons Travel for international tour packages, visa assistance, and trip planning." },
  "/faq": { title: "Travel FAQs | Bablons Travel", description: "Find answers about international tours, visas, bookings, payments, and travel planning." },
  "/plan-your-trip": { title: "Plan Your Trip | Bablons Travel", description: "Share your travel plans with Bablons Travel and get help creating a customized itinerary." },
  "/privacy-policy": { title: "Privacy Policy | Bablons Travel", description: "Read how Bablons Travel handles your personal information and website data." },
  "/terms-and-conditions": { title: "Terms and Conditions | Bablons Travel", description: "Review the terms for Bablons Travel enquiries, package bookings, payments, and itinerary changes." },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  const faq = Object.values(faqPageConfigs).find((entry) => entry.path === path);
  const newsDetail = path.startsWith("/news/") || path.startsWith("/travel-news/");
  const page = staticSeo[path] || (faq ? { title: `${faq.title} | Bablons Travel`, description: faq.description } : newsDetail ? { title: "Travel News | Bablons Travel", description: "Read the latest travel news and updates from Bablons Travel." } : path.startsWith("/gallery/") ? { title: "Travel Gallery | Bablons Travel", description: "Explore travel photos and destinations with Bablons Travel." } : null);
  if (!page) return {};
  const canonicalPath = path === "/contact" ? "/contact-us" : path.startsWith("/news/") ? path.replace("/news/", "/travel-news/") : path;
  const canonical = `${SITE_URL}${canonicalPath}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: { type: newsDetail ? "article" : "website", url: canonical, title: page.title, description: page.description, siteName: "Bablons Travel & Entertainment", locale: "en_IN", images: ["https://bablonstravelent.com/og-image.jpg"] },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: ["https://bablonstravelent.com/og-image.jpg"] },
  };
}

function JsonLd({ id, value }: { id: string; value: Record<string, unknown> }) {
  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }} />;
}

export default async function LegacyRoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = `/${slug.map(encodeURIComponent).join("/")}`;
  const knownLegacyRoutes = new Set([
    "/gallery", "/about", "/contact", "/faq", "/privacy-policy", "/terms-and-conditions", "/plan-your-trip",
    "/dubai/faq", "/thailand/faq", "/uzbekistan/faq", "/georgia/faq", "/visa-faq", "/flight-faq", "/hotel-faq", "/payment-faq", "/emi-faq", "/passport-faq", "/travel-insurance-faq", "/honeymoon-faq", "/family-tour-faq", "/group-tour-faq", "/corporate-tour-faq", "/student-tour-faq", "/luxury-tour-faq", "/budget-tour-faq", "/packing-faq", "/travel-safety-faq",
  ]);

  const newsRoute = path === "/news" || path.startsWith("/news/") || path === "/travel-news";
  const galleryDetailRoute = path.startsWith("/gallery/");
  const faqRoute = Object.values(faqPageConfigs).some((entry) => entry.path === path);
  if (!knownLegacyRoutes.has(path) && !newsRoute && !galleryDetailRoute && !faqRoute) notFound();
  const faq = Object.values(faqPageConfigs).find((entry) => entry.path === path);
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    ...(faq ? [{ "@type": "ListItem", position: 2, name: "FAQs", item: `${SITE_URL}/faq` }, { "@type": "ListItem", position: 3, name: faq.title, item: `${SITE_URL}${path}` }] : []),
  ];
  return <>
    {faq ? <JsonLd id="faq-page-jsonld" value={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} /> : null}
    {faq ? <JsonLd id="faq-breadcrumb-jsonld" value={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbItems }} /> : null}
    <LegacyPublicApp />
  </>;
}
