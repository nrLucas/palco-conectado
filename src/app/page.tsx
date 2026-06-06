import {
  LandingCta,
  LandingFeatures,
  LandingHero,
  LandingProductPreview,
  LandingStats,
} from "@/components/landing";

export default function Home() {
  return (
    <main>
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingProductPreview />
      <LandingCta />
    </main>
  );
}
