import {
  ActionIcon,
  Box,
  Group,
  Image,
  Title,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons';
import { useRouter } from 'next/router';
import React from 'react';

export function Brand() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();

  return (
    <Box
      sx={(theme) => ({
        paddingLeft: theme.spacing.xs,
        paddingRight: theme.spacing.xs,
        paddingBottom: theme.spacing.lg,
        borderBottom: `1px solid ${
          theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
      })}
    >
      <Group position="apart">
        <UnstyledButton>
          <Group>
            <Image src="/favicon.svg" width="50px" height="50px" mt="-8px" />
            <Title
              onClick={() => {
                router.push('/');
              }}
            >
              Bracket
            </Title>
          </Group>
        </UnstyledButton>
        <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
          {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
        </ActionIcon>
      </Group>
    </Box>
  );
}
