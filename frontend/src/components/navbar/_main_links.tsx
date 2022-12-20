import { ThemeIcon } from '@mantine/core';
import { AiOutlineTeam } from '@react-icons/all-files/ai/AiOutlineTeam';
import { BsFillPersonFill } from '@react-icons/all-files/bs/BsFillPersonFill';
import { IconAlertCircle } from '@tabler/icons';
import { NextRouter, useRouter } from 'next/router';
import React from 'react';

import { useNavbarStyles } from './_user';

interface MainLinkProps {
  icon: React.ReactNode;
  label: string;
  endpoint: string;
  router: NextRouter;
}

function MainLink({ router, icon, label, endpoint }: MainLinkProps) {
  const { classes } = useNavbarStyles();
  return (
    <a href="#" className={classes.link} onClick={() => router.push(endpoint)}>
      <ThemeIcon variant="default">{icon}</ThemeIcon>
      <span style={{ marginLeft: '10px' }}>{label}</span>
    </a>
  );
}

export function MainLinks({ tournament_id }: any) {
  const router = useRouter();
  const tm_prefix = `/tournaments/${tournament_id}`;

  const data = [
    {
      icon: <IconAlertCircle size={16} />,
      label: 'Tournament',
      endpoint: `${tm_prefix}/`,
      router,
    },
    {
      icon: <BsFillPersonFill size={16} />,
      label: 'Players',
      endpoint: `${tm_prefix}/players`,
      router,
    },
    {
      icon: <AiOutlineTeam size={16} />,
      label: 'Teams',
      endpoint: `${tm_prefix}/teams`,
      router,
    },
  ];

  const links = data.map((link) => <MainLink {...link} key={link.label} />);
  return <div>{links}</div>;
}
