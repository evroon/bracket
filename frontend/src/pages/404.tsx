import { Button, Container, Group, Text, Title } from '@mantine/core';
import { SSRConfig, i18n as globali18n, useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import classes from './404.module.css';
import { getStaticProps } from './index';

export default function NotFoundTitle(props: SSRConfig) {
  const router = useRouter();
  const [lastData, setLastData] = useState<SSRConfig>();
  useEffect(() => {
    if (!props._nextI18Next) {
      if (lastData?._nextI18Next?.initialI18nStore) {
        Object.keys(lastData._nextI18Next.initialI18nStore).forEach((l) => {
          Object.keys(lastData?._nextI18Next?.initialI18nStore[l]).forEach((n) => {
            globali18n?.addResourceBundle(l, n, lastData?._nextI18Next?.initialI18nStore[l][n]);
          });
        });
        globali18n?.changeLanguage(lastData._nextI18Next.initialLocale);
      }
      return;
    }
    setLastData(props);
  }, [props]);
  const { t } = useTranslation();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}> {t('not_found_title')}</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        {t('not_found_description')}
      </Text>
      <Group justify="center">
        <Button variant="subtle" size="md" onClick={() => router.push('/')}>
          {t('back_home_nav')}
        </Button>
      </Group>
    </Container>
  );
}

export { getStaticProps };
