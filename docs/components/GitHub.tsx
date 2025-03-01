import { buttonVariants } from "./ui/button";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export const GitHub = () => {
  return (
    <section className="container place-items-center py-20">
      <section className="md:w-2/3">
        <Link
          href="https://github.com/evroon/bracket"
          className={`w-full h-15 md:text-2xl border-2 ${buttonVariants({
            variant: "outline",
          })}`}
        >
          <FaGithub
            size="32px"
            style={{ marginRight: "1rem", height: "32px" }}
          />
          Github Repository
        </Link>
      </section>
    </section>
  );
};
