import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { HowItWorks } from "../components/HowItWorks";
import { Features } from "../components/Features";
import { Cta } from "../components/Cta";
import "./page.css";
import { PreviewImage } from "../components/PreviewImage";

export default function Page() {
  return (
    <>
      <Hero />
      <PreviewImage />
      <About />
      <HowItWorks />
      <Features />
      {/*<AdvancedFeatures />*/}
      <Cta />
      {/*<FAQ />*/}
    </>
  );
}
