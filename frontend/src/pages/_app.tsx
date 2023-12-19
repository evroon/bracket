import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';
import { Analytics } from '@vercel/analytics/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';

import { BracketSpotlight } from '../components/modals/spotlight';

const App = ({ Component, pageProps }: any) => (
  <>
    <Head>
      <title>Bracket</title>
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="shortcut icon" href="/favicon.svg" />

      <ColorSchemeScript defaultColorScheme="auto" />
    </Head>

    <MantineProvider defaultColorScheme="auto">
      <BracketSpotlight />
      <Notifications />
      <Component {...pageProps} />
      <Analytics />
    </MantineProvider>
  </>
);

export default appWithTranslation(App);
