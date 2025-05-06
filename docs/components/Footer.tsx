import Link from "next/link";
import Image from "next/image";
import logo from "../content/img/logo.svg";

export const Footer = () => {
  return (
    <footer id="footer">
      <hr className="w-11/12 mx-auto" />

      <section className="container py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
        <div className="col-span-full xl:col-span-2">
          <Link href="/" className="font-bold text-xl flex">
            <Image
              width={36}
              height={36}
              src={logo.src}
              className="mr-2"
              alt="Logo of Bracket"
            />
            <b className="text-3xl">Bracket</b>
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Intro</h3>
          <div>
            <Link href="/docs" className="opacity-60 hover:opacity-100">
              Introduction
            </Link>
          </div>

          <div>
            <Link
              href="/docs/running-bracket/quickstart"
              className="opacity-60 hover:opacity-100"
            >
              Quickstart
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Running Bracket</h3>
          <div>
            <Link
              href="/docs/running-bracket/configuration"
              className="opacity-60 hover:opacity-100"
            >
              Configuration
            </Link>
          </div>

          <div>
            <Link
              href="/docs/deployment"
              className="opacity-60 hover:opacity-100"
            >
              Deployment
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">About</h3>
          <div>
            <Link
              href="/docs/usage/guide"
              className="opacity-60 hover:opacity-100"
            >
              Usage
            </Link>
          </div>

          <div>
            <Link
              href="/docs/running-bracket/faq"
              className="opacity-60 hover:opacity-100"
            >
              FAQ
            </Link>
          </div>

          <div>
            <Link
              href="https://github.com/evroon/bracket/blob/master/LICENSE"
              className="opacity-60 hover:opacity-100"
            >
              License
            </Link>
          </div>

          <div>
            <Link
              href="https://github.com/evroon/bracket/releases"
              className="opacity-60 hover:opacity-100"
            >
              Releases
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Community</h3>
          <div>
            <Link
              href="https://github.com/evroon/bracket"
              className="opacity-60 hover:opacity-100"
            >
              GitHub
            </Link>
          </div>

          <div>
            <Link
              href="/docs/community/contributing/"
              className="opacity-60 hover:opacity-100"
            >
              Contributing
            </Link>
          </div>

          <div>
            <Link
              href="/docs/community/development/"
              className="opacity-60 hover:opacity-100"
            >
              Development
            </Link>
          </div>
        </div>
      </section>

      <section className="container pb-14 text-center">
        <h3>
          Bracket - Open-source Tournament System.
          <br />
          Licensed under AGPL-v3.0. Copyright © {new Date().getFullYear()}{" "}
          Bracket. Built with Nextra.
        </h3>
      </section>
    </footer>
  );
};
