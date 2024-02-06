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

  // Set the production url of your site here
  url: "https://your-docusaurus-test-site.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/bracket/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "evroon", // Usually your GitHub org/user name.
  projectName: "bracket", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
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
      image: "img/logo.svg",
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
                to: "/docs/running-bracket/deployment",
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
