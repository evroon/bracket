import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { HowItWorks } from "../components/HowItWorks";
import { Features } from "../components/Features";
import { Cta } from "../components/Cta";
import "./page.css";
import { PreviewImage } from "../components/PreviewImage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bracket docs",
  description: "Bracket (docs) - free and open-source tournament system",
};
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
