import { Tooltip, UnstyledButton } from '@mantine/core';
import {
  Icon,
  IconCalendar,
  IconSettings,
  IconSoccerField,
  IconTournament,
  IconTrophy,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { NextRouter, useRouter } from 'next/router';
import React from 'react';

import classes from './_main_links.module.css';

interface MainLinkProps {
  icon: Icon;
  label: string;
  endpoint: string;
  router: NextRouter;
}

function MainLink({ item, pathName }: { item: MainLinkProps; pathName: String }) {
  return (
    <Tooltip position="right" label={item.label} transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={() => item.router.push(item.endpoint)}
        className={classes.link}
        data-active={pathName === item.endpoint || undefined}
      >
        <item.icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

export function MainLinks({ tournament_id }: any) {
  const router = useRouter();
  const tm_prefix = `/tournaments/${tournament_id}`;
  const pathName = router.pathname.replace('[id]', tournament_id).replace(/\/+$/, '');

  const data = [
    {
      icon: IconTournament,
      label: 'Schedule',
      endpoint: `${tm_prefix}`,
      router,
    },
    {
      icon: IconUser,
      label: 'Players',
      endpoint: `${tm_prefix}/players`,
      router,
    },
    {
      icon: IconUsers,
      label: 'Teams',
      endpoint: `${tm_prefix}/teams`,
      router,
    },
    {
      icon: IconSoccerField,
      label: 'Courts',
      endpoint: `${tm_prefix}/courts`,
      router,
    },
    {
      icon: IconTrophy,
      label: 'Stages',
      endpoint: `${tm_prefix}/stages`,
      router,
    },
    {
      icon: IconCalendar,
      label: 'Planning',
      endpoint: `${tm_prefix}/schedule`,
      router,
    },
    {
      icon: IconSettings,
      label: 'Tournament Settings',
      endpoint: `${tm_prefix}/settings`,
      router,
    },
  ];

  const links = data.map((link) => <MainLink key={link.label} item={link} pathName={pathName} />);
  return <div>{links}</div>;
}
