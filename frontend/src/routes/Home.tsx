import CardContainer from "../components/home/CardContainer";
import FeatureSection from "../components/home/FeatureSection";
import Hero from "../components/home/Hero";

/**
 * Home page — composes the {@link Hero}, {@link CardContainer}, and {@link FeatureSection}
 * sections. No props required.
 */
export default function Home() {
  return (
    <div>
      <Hero />
      <CardContainer />
      <FeatureSection />
    </div>
  );
}
