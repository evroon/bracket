import { Center, Divider, Group, Tooltip, UnstyledButton } from '@mantine/core';
import {
  Icon,
  IconBook,
  IconBrandGithub,
  IconBrowser,
  IconCalendar,
  IconDots,
  IconHome,
  IconLogout,
  IconSettings,
  IconSoccerField,
  IconTournament,
  IconTrophy,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { NextRouter, useRouter } from 'next/router';
import React from 'react';

import { getBaseApiUrl } from '../../services/adapter';
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
  return [
    { link: '/clubs', label: 'Clubs', links: [], icon: IconUsers },
    { link: '/', label: 'Tournaments', links: [], icon: IconHome },
    {
      link: '/user',
      label: 'User',
      links: [{ link: '/user', label: 'Logout', icon: IconLogout }],
      icon: IconUser,
    },
    {
      icon: IconDots,
      link: '',
      label: 'More',
      links: [
        { link: 'https://evroon.github.io/bracket/', label: 'Website', icon: IconBrowser },
        { link: 'https://github.com/evroon/bracket', label: 'GitHub', icon: IconBrandGithub },
        { link: `${getBaseApiUrl()}/docs`, label: 'API docs', icon: IconBook },
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
  const tm_prefix = `/tournaments/${tournament_id}`;
  const pathName = router.pathname.replace('[id]', tournament_id).replace(/\/+$/, '');

  const data = [
    {
      icon: IconTournament,
      label: 'Schedule',
      link: `${tm_prefix}`,
    },
    {
      icon: IconUser,
      label: 'Players',
      link: `${tm_prefix}/players`,
    },
    {
      icon: IconUsers,
      label: 'Teams',
      link: `${tm_prefix}/teams`,
    },
    {
      icon: IconSoccerField,
      label: 'Courts',
      link: `${tm_prefix}/courts`,
    },
    {
      icon: IconTrophy,
      label: 'Stages',
      link: `${tm_prefix}/stages`,
    },
    {
      icon: IconCalendar,
      label: 'Planning',
      link: `${tm_prefix}/schedule`,
    },
    {
      icon: IconSettings,
      label: 'Tournament Settings',
      link: `${tm_prefix}/settings`,
    },
  ];

  const links = data.map((link) => (
    <MainLink router={router} key={link.label} item={link} pathName={pathName} />
  ));
  return (
    <>
      <Center hiddenFrom="sm">
        <h2>Tournament</h2>
      </Center>
      <Divider hiddenFrom="sm" />
      {links}
    </>
  );
}
