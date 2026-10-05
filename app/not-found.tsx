import LegacyPublicApp from "@/app/legacy-public-client";

export const metadata = {
  title: "Page Not Found | Bablons Travel",
  description: "The travel page you are looking for could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <LegacyPublicApp />;
}
