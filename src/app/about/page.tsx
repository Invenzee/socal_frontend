import AboutHero from "@/components/about/about-hero";
import AboutBrands from "@/components/about/about-brands";
import AboutIntro from "@/components/about/about-intro";
import WhyChoose from "@/components/about/why-choose";
import GetStartedActions from "@/components/get-started-actions";
import Testimonials from "@/components/testimonials";
import ReadyToListings from "@/components/ready-to-listings";

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutBrands />
      <AboutIntro />
      <WhyChoose />
      <GetStartedActions />
      <Testimonials />
      <ReadyToListings />
    </main>
  );
}
