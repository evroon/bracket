import { rem } from '@mantine/core';
import { Spotlight, SpotlightActionData } from '@mantine/spotlight';
import {
  IconCalendarEvent,
  IconHome,
  IconSearch,
  IconSettings,
  IconSoccerField,
  IconTrophy,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React from 'react';

import { getTournamentIdFromRouter } from '../utils/util';

export function BracketSpotlight() {
  const router = useRouter();
  const { id: tournamentId } = getTournamentIdFromRouter();

  const actions: SpotlightActionData[] = [
    {
      id: 'home',
      title: 'Home',
      description: 'Get to home page',
      onClick: () => router.push('/'),
      leftSection: <IconHome size="1.2rem" />,
    },
    {
      id: 'clubs',
      title: 'Clubs',
      description: 'View, add or delete clubs',
      onClick: () => router.push('/clubs'),
      leftSection: <IconUsersGroup size="1.2rem" />,
    },
    {
      id: 'user settings',
      title: 'User Settings',
      description: 'Change name, email, password etc.',
      onClick: () => router.push('/user'),
      leftSection: <IconUser size="1.2rem" />,
    },
  ];

  const tournamentActions: SpotlightActionData[] = [
    {
      id: 'planning',
      title: 'Planning',
      description: 'Change planning of matches',
      onClick: () => router.push(`/tournaments/${tournamentId}/schedule`),
      leftSection: <IconCalendarEvent size="1.2rem" />,
    },
    {
      id: 'teams',
      title: 'Teams',
      description: 'View, add or delete teams',
      onClick: () => router.push(`/tournaments/${tournamentId}/teams`),
      leftSection: <IconUsers size="1.2rem" />,
    },
    {
      id: 'players',
      title: 'Players',
      description: 'View, add or delete players',
      onClick: () => router.push(`/tournaments/${tournamentId}/players`),
      leftSection: <IconUsers size="1.2rem" />,
    },
    {
      id: 'stages',
      title: 'Stages',
      description: 'Change the layout of the tournament',
      onClick: () => router.push(`/tournaments/${tournamentId}/stages`),
      leftSection: <IconTrophy size="1.2rem" />,
    },
    {
      id: 'courts',
      title: 'Courts',
      description: 'View, add or delete courts',
      onClick: () => router.push(`/tournaments/${tournamentId}/courts`),
      leftSection: <IconSoccerField size="1.2rem" />,
    },
    {
      id: 'tournament settings',
      title: 'Tournament settings',
      description: 'Change settings of the tournament',
      onClick: () => router.push(`/tournaments/${tournamentId}/settings`),
      leftSection: <IconSettings size="1.2rem" />,
    },
  ];
  const allActions = tournamentId >= 0 ? actions.concat(tournamentActions) : actions;
  return (
    <Spotlight
      actions={allActions}
      shortcut={['mod + k', 'mod + y', '/']}
      nothingFound="Nothing found..."
      highlightQuery
      searchProps={{
        leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
        placeholder: 'Search...',
      }}
    />
  );
}
