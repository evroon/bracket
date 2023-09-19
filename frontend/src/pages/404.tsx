import { Button, Container, Group, Text, Title } from '@mantine/core';
import { useRouter } from 'next/router';

import classes from './404.module.css';

export default function NotFoundTitle() {
  const router = useRouter();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}>You have found a secret place.</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}>
        Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has
        been moved to another URL.
      </Text>
      <Group justify="center">
        <Button variant="subtle" size="md" onClick={() => router.push('/')}>
          Take me back to home page
        </Button>
      </Group>
    </Container>
  );
}
