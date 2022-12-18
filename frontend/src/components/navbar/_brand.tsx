import { ActionIcon, Box, Group, Title, useMantineColorScheme } from '@mantine/core';
import { GiShuttlecock } from '@react-icons/all-files/gi/GiShuttlecock';
import { IconMoonStars, IconSun } from '@tabler/icons';
import Link from 'next/link';
import React from 'react';

export function Brand() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

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
        <GiShuttlecock size={28} />
        <Title>
          <Link href="/">Ladderz</Link>
        </Title>
        <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
          {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
        </ActionIcon>
      </Group>
    </Box>
  );
}
