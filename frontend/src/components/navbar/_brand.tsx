import { Box, Group, Image, Title, UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';

export function Brand() {
  const router = useRouter();

  return (
    <Box
      sx={() => ({
        paddingTop: '1rem',
      })}
    >
      <Group position="apart" ml="1rem">
        <UnstyledButton>
          <Group>
            <Image src="/favicon.svg" width="40px" height="40px" mt="-0.5rem" />
            <Title
              onClick={async () => {
                await router.push('/');
              }}
            >
              Bracket
            </Title>
          </Group>
        </UnstyledButton>
      </Group>
    </Box>
  );
}
