import { Center, Divider, Group, Tooltip, UnstyledButton } from '@mantine/core';
import {
  Icon,
  IconBook,
  IconBrandGithub,
  IconBrowser,
  IconCalendar,
  IconDots,
  IconHome,
  IconSettings,
  IconSoccerField,
  IconTournament,
  IconTrophy,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { NextRouter, useRouter } from 'next/router';
import React from 'react';

import { getBaseApiUrl } from '../../services/adapter';
import { capitalize } from '../utils/util';
import classes from './_main_links.module.css';

interface MainLinkProps {
  icon: Icon;
  label: string;
  link: string;
  links?: MainLinkProps[] | null;
}

function MainLinkMobile({
  router,
  item,
  pathName,
}: {
  router: NextRouter;
  item: MainLinkProps;
  pathName: String;
}) {
  return (
    <>
      <UnstyledButton
        hiddenFrom="sm"
        className={classes.mobileLink}
        style={{ width: '100%' }}
        onClick={() => router.push(item.link)}
        data-active={pathName === item.link || undefined}
      >
        <Group className={classes.mobileLinkGroup}>
          <item.icon stroke={1.5} />
          <p style={{ marginLeft: '0.5rem' }}>{item.label}</p>
        </Group>
        <Divider />
      </UnstyledButton>
    </>
  );
}

function MainLink({
  router,
  item,
  pathName,
}: {
  router: NextRouter;
  item: MainLinkProps;
  pathName: String;
}) {
  return (
    <>
      <Tooltip position="right" label={item.label} transitionProps={{ duration: 0 }}>
        <UnstyledButton
          visibleFrom="sm"
          onClick={() => router.push(item.link)}
          className={classes.link}
          data-active={pathName === item.link || undefined}
        >
          <item.icon stroke={1.5} />
        </UnstyledButton>
      </Tooltip>
      <MainLinkMobile router={router} item={item} pathName={pathName} />
    </>
  );
}

export function getBaseLinksDict() {
  const { t } = useTranslation();

  return [
    { link: '/clubs', label: capitalize(t('clubs_title')), links: [], icon: IconUsers },
    { link: '/', label: capitalize(t('tournaments_title')), links: [], icon: IconHome },
    {
      link: '/user',
      label: t('user_title'),
      links: [],
      icon: IconUser,
    },
    {
      icon: IconDots,
      link: '',
      label: t('more_title'),
      links: [
        { link: 'https://docs.bracketapp.nl/', label: t('website_title'), icon: IconBrowser },
        {
          link: 'https://github.com/evroon/bracket',
          label: t('github_title'),
          icon: IconBrandGithub,
        },
        { link: `${getBaseApiUrl()}/docs`, label: t('api_docs_title'), icon: IconBook },
      ],
    },
  ];
}

export function getBaseLinks() {
  const router = useRouter();
  const pathName = router.pathname.replace(/\/+$/, '');
  return getBaseLinksDict()
    .filter((link) => link.links.length < 1)
    .map((link) => (
      <MainLinkMobile router={router} key={link.label} item={link} pathName={pathName} />
    ));
}

export function TournamentLinks({ tournament_id }: any) {
  const router = useRouter();
  const { t } = useTranslation();
  const tm_prefix = `/tournaments/${tournament_id}`;
  const pathName = router.pathname.replace('[id]', tournament_id).replace(/\/+$/, '');

  const data = [
    {
      icon: IconTournament,
      label: capitalize(t('schedule_title')),
      link: `${tm_prefix}`,
    },
    {
      icon: IconUser,
      label: capitalize(t('players_title')),
      link: `${tm_prefix}/players`,
    },
    {
      icon: IconUsers,
      label: capitalize(t('teams_title')),
      link: `${tm_prefix}/teams`,
    },
    {
      icon: IconSoccerField,
      label: capitalize(t('courts_title')),
      link: `${tm_prefix}/courts`,
    },
    {
      icon: IconTrophy,
      label: capitalize(t('stage_title')),
      link: `${tm_prefix}/stages`,
    },
    {
      icon: IconCalendar,
      label: capitalize(t('planning_title')),
      link: `${tm_prefix}/schedule`,
    },
    {
      icon: IconSettings,
      label: capitalize(t('tournament_setting_title')),
      link: `${tm_prefix}/settings`,
    },
  ];

  const links = data.map((link) => (
    <MainLink router={router} key={link.label} item={link} pathName={pathName} />
  ));
  return (
    <>
      <Center hiddenFrom="sm">
        <h2>{capitalize(t('tournament_title'))}</h2>
      </Center>
      <Divider hiddenFrom="sm" />
      {links}
    </>
  );
}
