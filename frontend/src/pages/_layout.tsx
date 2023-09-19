import {
  ActionIcon,
  AppShell,
  Burger,
  Center,
  Container,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { NextRouter, useRouter } from 'next/router';
import React, { Component, ReactNode } from 'react';

import { Brand } from '../components/navbar/_brand';
import { getBaseApiUrl } from '../services/adapter';
import classes from './_layout.module.css';

const LINKS = [
  { link: '/clubs', label: 'Clubs', links: null },
  { link: '/', label: 'Tournaments', links: null },
  { link: '/user', label: 'User', links: [{ link: '/user', label: 'Logout', icon: null }] },
  {
    link: null,
    label: 'More',
    links: [
      { link: 'https://evroon.github.io/bracket/', label: 'Website', icon: null },
      { link: 'https://github.com/evroon/bracket', label: 'GitHub', icon: <FaGithub size={20} /> },
      { link: `${getBaseApiUrl()}/docs`, label: 'API docs', icon: null },
    ],
  },
];

interface HeaderActionLink {
  link: string | null;
  label: string;
  icon?: Component | null;
  links?: { link: string; label: string; icon?: ReactNode }[] | null;
}

interface HeaderActionProps {
  links: HeaderActionLink[];
  navbarState: any;
}

function getMenuItemsForLink(link: HeaderActionLink, _classes: any, router: NextRouter) {
  const menuItems = link.links?.map((item) => (
    <UnstyledButton
      key={item.label}
      className={classes.link}
      onClick={async () => {
        await router.push(item.link);
      }}
    >
      {item.label}
    </UnstyledButton>
  ));
  return (
    <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
      <Menu.Target>
        <UnstyledButton
          className={classes.link}
          onClick={async () => {
            if (link.link) await router.push(link.link);
          }}
        >
          <>
            {link.icon}
            <Text span className={classes.linkLabel}>
              {link.label}
            </Text>
          </>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>{menuItems}</Menu.Dropdown>
    </Menu>
  );
}

export function HeaderAction({ links, navbarState }: HeaderActionProps) {
  // const { classes } = useStyles();

  const [opened, { toggle }] = navbarState != null ? navbarState : [false, { toggle: () => {} }];
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const router = useRouter();

  const items = links.map((link) => {
    if (link.links) {
      return getMenuItemsForLink(link, classes, router);
    }

    return (
      <UnstyledButton
        key={link.label}
        className={classes.link}
        onClick={async () => {
          if (link.link) await router.push(link.link);
        }}
      >
        {link.label}
      </UnstyledButton>
    );
  });
  return (
    <AppShell.Header>
      <Container className={classes.inner} fluid>
        <Center>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Brand />
        </Center>
        <Group gap={5} className={classes.links}>
          {items}
          <ActionIcon
            variant="default"
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            size={30}
            ml="1rem"
          >
            <IconSun size={16} className={classes.light} />
            <IconMoonStars size={16} className={classes.dark} />
          </ActionIcon>
        </Group>
      </Container>
    </AppShell.Header>
  );
}

export default function Layout({ children, navbar }: any) {
  const navbarState = useDisclosure();
  const [opened] = navbarState;
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 80,
        breakpoint: 'sm',
        collapsed: { desktop: navbar == null, mobile: navbar == null || !opened },
      }}
      padding="md"
    >
      <HeaderAction links={LINKS} navbarState={navbarState} />
      {navbar}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
