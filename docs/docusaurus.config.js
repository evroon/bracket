// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require("prism-react-renderer");
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Bracket",
  tagline: "Free and open source tournament scheduling system",
  favicon: "img/logo.svg",
  url: "https://docs.bracketapp.nl",
  baseUrl: "/",
  organizationName: "evroon",
  projectName: "bracket",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  scripts: [
    {
      src: "https://analytics.bracketapp.nl/script.js",
      async: true,
      "data-website-id": "9c5b1839-5cbd-4d04-b95b-a217838898a9",
      "data-domains": "docs.bracketapp.nl",
    },
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/evroon/bracket/tree/master/docs/",
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/evroon/bracket/tree/master/docs/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  plugins: [require.resolve("docusaurus-lunr-search")],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/bracket-screenshot-design.png",
      navbar: {
        title: "Bracket",
        logo: {
          alt: "Bracket Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Documentation",
          },
          {
            label: "Quickstart",
            href: "/docs/running-bracket/quickstart",
            position: "left",
          },
          {
            href: "https://github.com/evroon/bracket",
            label: "GitHub",
            position: "left",
          },
        ],
      },
      colorMode: {
        defaultMode: "dark",
        respectPrefersColorScheme: false,
        disableSwitch: true,
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Intro",
            items: [
              {
                label: "Introduction",
                to: "/docs/intro",
              },
              {
                label: "Quickstart",
                to: "/docs/running-bracket/quickstart",
              },
            ],
          },
          {
            title: "Running Bracket",
            items: [
              {
                label: "Configuration",
                to: "/docs/running-bracket/configuration",
              },
              {
                label: "Deployment",
                to: "/docs/deployment",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Contributing",
                to: "/docs/community/contributing",
              },
              {
                label: "Developing",
                to: "/docs/community/development",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/evroon/bracket",
              },
              {
                label: "License",
                href: "https://github.com/evroon/bracket/blob/master/LICENSE",
              },
              {
                label: "Changelog",
                href: "https://github.com/evroon/bracket/releases",
              },
            ],
          },
        ],
        copyright: `Bracket - Self-Hosted Tournament System.<br/> Licensed under AGPL-v3.0. Copyright © ${new Date().getFullYear()} Bracket. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["bash", "diff", "json"],
      },
    }),
};

module.exports = config;
