import { Container, Text, Title } from '@mantine/core';

import classes from '@404.module.css';

export default function GenericErrorPage() {
  return (
    <Container className={classes.root}>
      <div className={classes.label}>500</div>
      <Title className={classes.title}> An unknown error occurred</Title>
      <Text c="dimmed" size="lg" ta="center" className={classes.description}></Text>
    </Container>
  );
}
