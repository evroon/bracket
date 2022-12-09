import React from 'react';
import { Group, ActionIcon, useMantineColorScheme, Box, Title } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons';
import { Logo } from './_logo';
import { GiShuttlecock } from '@react-icons/all-files/gi/GiShuttlecock';

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
        <Title>Ladderz</Title>
        <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
          {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
        </ActionIcon>
      </Group>
    </Box>
  );
}
