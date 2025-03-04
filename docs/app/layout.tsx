import { Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

import logo from "../content/img/logo.svg";
import Image from "next/image";
import { Footer } from "../components/Footer";

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
};

const navbar = (
  <Navbar
    logo={
      <>
        <Image
          width={36}
          height={36}
          src={logo.src}
          className="mr-2"
          alt="Preview of Bracket"
        />
        <b className="text-3xl">Bracket</b>
      </>
    }
    projectLink="https://github.com/evroon/bracket"
    // ... Your additional navbar options
  />
);

// @ts-expect-error 123123213
export default async function RootLayout({ children }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
      className="dark"
    >
      <Head>
        <script
          async
          src="https://analytics.bracketapp.nl/script.js"
          data-website-id="9c5b1839-5cbd-4d04-b95b-a217838898a9"
          data-domains="docs.bracketapp.nl"
        ></script>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <body>
        <Layout
          darkMode={true}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/evroon/bracket/tree/master/docs"
          footer={<Footer />}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
