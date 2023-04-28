import { Tooltip, UnstyledButton } from '@mantine/core';
import { IconTournament, IconUser, IconUsers, TablerIcon } from '@tabler/icons';
import { NextRouter, useRouter } from 'next/router';
import React from 'react';

import { useNavbarStyles } from './_user';

interface MainLinkProps {
  icon: TablerIcon;
  label: string;
  endpoint: string;
  router: NextRouter;
}

function MainLink({ item, pathName }: { item: MainLinkProps; pathName: String }) {
  const { classes, cx } = useNavbarStyles();
  return (
    <Tooltip label={item.label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={() => item.router.push(item.endpoint)}
        className={cx(classes.link, { [classes.linkActive]: pathName === item.endpoint })}
      >
        {/*<Icon size="1.2rem" stroke={1.5} />*/}
        <item.icon className={classes.linkIcon} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
    // <a
    //   href="#"
    //   key={item.endpoint}
    //   className={cx(classes.link, { [classes.linkActive]: pathName === item.endpoint })}
    //   onClick={() => item.router.push(item.endpoint)}
    // >
    //   <item.icon className={classes.linkIcon} stroke={1.5} />
    //   <span style={{ marginLeft: '10px' }}>{item.label}</span>
    // </a>
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
  ];

  const links = data.map((link) => <MainLink key={link.label} item={link} pathName={pathName} />);
  return <div>{links}</div>;
}
