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
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';

import { getTournamentIdFromRouter } from '../utils/util';

export function BracketSpotlight() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id: tournamentId } = getTournamentIdFromRouter();

  const actions: SpotlightActionData[] = [
    {
      id: 'home',
      title: t('home_title'),
      description: t('home_spotlight_description'),
      onClick: () => router.push('/'),
      leftSection: <IconHome size="1.2rem" />,
    },
    {
      id: 'clubs',
      title: t('clubs_title'),
      description: t('clubs_spotlight_description'),
      onClick: () => router.push('/clubs'),
      leftSection: <IconUsersGroup size="1.2rem" />,
    },
    {
      id: 'user settings',
      title: t('user_settings_title'),
      description: t('user_settings_spotlight_description'),
      onClick: () => router.push('/user'),
      leftSection: <IconUser size="1.2rem" />,
    },
  ];

  const tournamentActions: SpotlightActionData[] = [
    {
      id: 'planning',
      title: t('planning_title'),
      description: t('planning_spotlight_description'),
      onClick: () => router.push(`/tournaments/${tournamentId}/schedule`),
      leftSection: <IconCalendarEvent size="1.2rem" />,
    },
    {
      id: 'teams',
      title: t('teams_title'),
      description: t('teams_spotlight_description'),
      onClick: () => router.push(`/tournaments/${tournamentId}/teams`),
      leftSection: <IconUsers size="1.2rem" />,
    },
    {
      id: 'players',
      title: t('players_title'),
      description: t('players_spotlight_description'),
      onClick: () => router.push(`/tournaments/${tournamentId}/players`),
      leftSection: <IconUsers size="1.2rem" />,
    },
    {
      id: 'stages',
      title: t('stage_title'),
      description: t('stage_spotlight_description'),
      onClick: () => router.push(`/tournaments/${tournamentId}/stages`),
      leftSection: <IconTrophy size="1.2rem" />,
    },
    {
      id: 'courts',
      title: t('courts_title'),
      description: t('court_spotlight_description'),
      onClick: () => router.push(`/tournaments/${tournamentId}/courts`),
      leftSection: <IconSoccerField size="1.2rem" />,
    },
    {
      id: 'tournament settings',
      title: t('tournament_setting_title'),
      description: t('tournament_setting_spotlight_description'),
      onClick: () => router.push(`/tournaments/${tournamentId}/settings`),
      leftSection: <IconSettings size="1.2rem" />,
    },
  ];
  const allActions = tournamentId >= 0 ? actions.concat(tournamentActions) : actions;
  return (
    <Spotlight
      actions={allActions}
      shortcut={['mod + k', 'mod + y', '/']}
      nothingFound={t('nothing_found_placeholder')}
      highlightQuery
      searchProps={{
        leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
        placeholder: t('search_placeholder'),
      }}
    />
  );
}
