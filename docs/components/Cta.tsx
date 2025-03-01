import { buttonVariants } from "./ui/button";
import Link from "next/link";
import { IconRocket } from "@tabler/icons-react";

export const Cta = () => {
  return (
    <section id="cta" className="bg-muted/50 py-16 my-24 sm:my-32">
      <div className="container lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl md:text-4xl font-bold ">
            Take
            <span className="bg-linear-to-b from-primary/70 to-primary text-transparent bg-clip-text">
              {" "}
              control{" "}
            </span>
            of your tournaments
          </h2>
          <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0">
            Keep your tournament software in your own hands: no vendor lock-in,
            no analytics data being collected, transparent & open-source
            software.
          </p>
        </div>

        <Link
          href="https://www.bracketapp.nl/demo"
          className={`w-full md:w-auto ${buttonVariants({
            variant: "default",
          })}`}
        >
          <IconRocket
            size="32px"
            style={{ marginRight: "0.5rem", height: "32px" }}
          />
          Launch Demo
        </Link>
      </div>
    </section>
  );
};
