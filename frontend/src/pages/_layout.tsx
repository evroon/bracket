import {
  ActionIcon,
  AppShell,
  Burger,
  Container,
  Group,
  Header,
  Menu,
  Text,
  UnstyledButton,
  createStyles,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { NextRouter, useRouter } from 'next/router';
import React, { Component, ReactNode } from 'react';

import { Brand } from '../components/navbar/_brand';
import { getBaseApiUrl } from '../services/adapter';

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

const HEADER_HEIGHT = rem(70);

const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },
}));

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

function getMenuItemsForLink(link: HeaderActionLink, classes: any, router: NextRouter) {
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
  const { classes } = useStyles();

  const [opened, { toggle }] = navbarState != null ? navbarState : [false, { toggle: () => {} }];
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
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
    <Header height={HEADER_HEIGHT} sx={{ borderBottom: 0 }} mb={120}>
      <Container className={classes.inner} fluid>
        <Group>
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
            mt="0.5rem"
          />
          <Brand />
        </Group>
        <Group spacing={5} className={classes.links}>
          {items}
          <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30} ml="1rem">
            {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
          </ActionIcon>
        </Group>
      </Container>
    </Header>
  );
}

export default function Layout({ children, navbar, navbarState }: any) {
  const theme = useMantineTheme();

  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      layout="default"
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      header={<HeaderAction links={LINKS} navbarState={navbarState} />}
      navbar={navbar}
    >
      {children}
    </AppShell>
  );
}
