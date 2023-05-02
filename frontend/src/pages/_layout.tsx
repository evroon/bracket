import {
  ActionIcon,
  AppShell,
  Burger,
  Container,
  Grid,
  Header,
  Menu,
  Text,
  UnstyledButton,
  createStyles,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React, { Component, ReactNode } from 'react';

import { Brand } from '../components/navbar/_brand';
import { getBaseApiUrl } from '../services/adapter';

const LINKS = [
  { link: '/clubs', label: 'Clubs', links: null },
  { link: '/', label: 'Tournaments', links: null },
  { link: '/user', label: 'User', links: [{ link: '/user', label: 'Logout', icon: null }] },
  {
    link: '/docs',
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

interface HeaderActionProps {
  links: {
    link: string;
    label: string;
    icon?: Component | null;
    links?: { link: string; label: string; icon?: ReactNode }[] | null;
  }[];
}
export function HeaderAction({ links }: HeaderActionProps) {
  const { classes } = useStyles();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [opened, { toggle }] = useDisclosure(false);

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item
        key={item.link}
        onClick={async () => {
          await router.push(item.link);
        }}
      >
        <Container>
          <span>{item.icon}</span>
          <span style={{ marginLeft: '0.25rem' }}>{item.label}</span>
        </Container>
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <UnstyledButton
              className={classes.link}
              onClick={async () => {
                await router.push(link.link);
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

    return (
      <UnstyledButton
        mr="1rem"
        key={link.label}
        className={classes.link}
        onClick={async () => {
          await router.push(link.link);
        }}
      >
        {link.label}
      </UnstyledButton>
    );
  });
  return (
    <Header height={{ base: HEADER_HEIGHT, md: HEADER_HEIGHT }}>
      <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" mt="0.5rem" />
      <Grid>
        <Grid.Col span={4}>
          <Brand />
        </Grid.Col>
        <Grid.Col span={4} offset={4}>
          <Container className={classes.inner} fluid style={{ justifyContent: 'end' }}>
            {items}
            {/*<Button radius="xl" h={30}>*/}
            {/*  Get early access*/}
            {/*</Button>*/}
            <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30} ml="1rem">
              {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
            </ActionIcon>
          </Container>
        </Grid.Col>
      </Grid>
    </Header>
  );
}

export default function Layout({ children, navbar }: any) {
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
      header={<HeaderAction links={LINKS} />}
      navbar={navbar}
    >
      {children}
    </AppShell>
  );
}
