import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
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

const theme = createTheme({
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
});

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

    <MantineProvider defaultColorScheme="auto" theme={theme}>
      <BracketSpotlight />
      <Notifications />
      <Component {...pageProps} />
      <Analytics />
    </MantineProvider>
  </>
);

export default appWithTranslation(App);
