import { buttonVariants } from "./ui/button";
import Link from "next/link";
import { IconLibrary, IconRocket } from "@tabler/icons-react";

export const Hero = () => {
  return (
    <section className="container place-items-center py-20 md:py-24 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">Free and open-source tournament management</h1>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Build tournament setups, add teams, schedule matches, keep track of
          scores and present ranking live to the public.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link
            href="https://www.bracketapp.nl/demo"
            className={`w-full md:w-1/3 h-12 ${buttonVariants({
              variant: "default",
            })}`}
          >
            <IconRocket
              size="32px"
              style={{ marginRight: "0.5rem", height: "32px" }}
            />
            Launch Demo
          </Link>

          <Link
            href="/docs"
            className={`w-full md:w-1/3 h-12 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            <IconLibrary
              size="24px"
              style={{ marginRight: "0.5rem", height: "32px" }}
            />
            Read the docs
          </Link>
        </div>
      </div>
      <div className="shadow-sm"></div>
    </section>
  );
};
