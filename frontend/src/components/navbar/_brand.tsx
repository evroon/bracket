import { Center, Group, Image, Text, Title, UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';

export function Brand() {
  const router = useRouter();

  return (
    <Center mr="1rem">
      <UnstyledButton
        onClick={async () => {
          await router.push('/');
        }}
      >
        <Group>
          <Image style={{ width: '38px', marginRight: '0px' }} src="/favicon.svg" />
          <Title style={{ height: '38px' }}>Bracket</Title>
        </Group>
      </UnstyledButton>
    </Center>
  );
}

export function BrandFooter() {
  return (
    <Center mr="1rem">
      <Center>
        <Image mb="0.25rem" style={{ width: '32px', marginRight: '0px' }} src="/favicon.svg" />
        <Text size="xl" ml="0.75rem">
          Bracket
        </Text>
      </Center>
    </Center>
  );
}
