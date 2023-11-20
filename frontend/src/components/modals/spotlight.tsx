import { SpotlightAction, SpotlightProvider } from '@mantine/spotlight';
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

export function Spotlight() {
  const router = useRouter();
  const { id: tournamentId } = getTournamentIdFromRouter();

  const actions: SpotlightAction[] = [
    {
      title: 'Home',
      description: 'Get to home page',
      onTrigger: () => router.push('/'),
      icon: <IconHome size="1.2rem" />,
    },
    {
      title: 'Clubs',
      description: 'View, add or delete clubs',
      onTrigger: () => router.push('/clubs'),
      icon: <IconUsersGroup size="1.2rem" />,
    },
    {
      title: 'User Settings',
      description: 'Change name, email, password etc.',
      onTrigger: () => router.push('/user'),
      icon: <IconUser size="1.2rem" />,
    },
  ];

  const tournamentActions: SpotlightAction[] = [
    {
      title: 'Planning',
      description: 'Change planning of matches',
      onTrigger: () => router.push(`/tournaments/${tournamentId}/schedule`),
      icon: <IconCalendarEvent size="1.2rem" />,
    },
    {
      title: 'Teams',
      description: 'View, add or delete teams',
      onTrigger: () => router.push(`/tournaments/${tournamentId}/teams`),
      icon: <IconUsers size="1.2rem" />,
    },
    {
      title: 'Players',
      description: 'View, add or delete players',
      onTrigger: () => router.push(`/tournaments/${tournamentId}/players`),
      icon: <IconUsers size="1.2rem" />,
    },
    {
      title: 'Stages',
      description: 'Change the layout of the tournament',
      onTrigger: () => router.push(`/tournaments/${tournamentId}/stages`),
      icon: <IconTrophy size="1.2rem" />,
    },
    {
      title: 'Courts',
      description: 'View, add or delete courts',
      onTrigger: () => router.push(`/tournaments/${tournamentId}/courts`),
      icon: <IconSoccerField size="1.2rem" />,
    },
    {
      title: 'Tournament settings',
      description: 'Change settings of the tournament',
      onTrigger: () => router.push(`/tournaments/${tournamentId}/settings`),
      icon: <IconSettings size="1.2rem" />,
    },
  ];
  const allActions = tournamentId >= 0 ? actions.concat(tournamentActions) : actions;
  return (
    <SpotlightProvider
      actions={allActions}
      searchIcon={<IconSearch size="1.2rem" />}
      searchPlaceholder="Search..."
      shortcut="mod + k"
      nothingFoundMessage="Nothing found..."
    ></SpotlightProvider>
  );
}
