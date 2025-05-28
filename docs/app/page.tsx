import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { HowItWorks } from "../components/HowItWorks";
import { Features } from "../components/Features";
import { Cta } from "../components/Cta";
import "./page.css";
import { PreviewImage } from "../components/PreviewImage";
import { Metadata } from "next";
import { Head } from "nextra/components";

export const metadata: Metadata = {
  title: "Bracket | Open-source tournament system",
  description:
    "Bracket is a free and open source tournament system. Set up a tournament, add teams, schedule matches, track scores and present live rankings.",
  openGraph: {
    title: "Bracket | Open-source tournament system",
    description:
      "Bracket is a free and open source tournament system. Set up a tournament, add teams, schedule matches, track scores and present live rankings.",
    locale: "en_US",
    url: "https://docs.bracketapp.nl",
    siteName: "Bracket",
    images: [{ url: "https://docs.bracketapp.nl/bracket-social-image.png" }],
  },
};
export default function Page() {
  return (
    <>
      <Head>
        {
          // https://developers.google.com/search/docs/appearance/site-names#json-ld_1
        }
        <script type="application/ld+json">
          {"{" +
            '"@context": "https://schema.org",' +
            '"@type": "WebSite",' +
            '"name": "Bracket",' +
            '"alternativeName": ["Bracket | Open-source tournament system", "Bracket documentation", "docs.bracketapp.nl"],' +
            '"url": "https://docs.bracketapp.nl"' +
            "}"}
        </script>
      </Head>
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
