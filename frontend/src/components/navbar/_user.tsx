import { Navbar, createStyles } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { FaBook } from '@react-icons/all-files/fa/FaBook';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { IconLogout } from '@tabler/icons';
import { useRouter } from 'next/router';
import React from 'react';

import { getBaseApiUrl } from '../../services/adapter';
import { performLogout } from '../../services/user';

export const useNavbarStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef('icon');

  return {
    navbar: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    },

    title: {
      textTransform: 'uppercase',
      letterSpacing: -0.25,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      fontSize: theme.fontSizes.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      '&, &:hover': {
        backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
          .background,
        color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        [`& .${icon}`]: {
          color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        },
      },
    },

    footer: {
      borderTop: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
      paddingTop: theme.spacing.md,
    },
  };
});

export function User() {
  const { classes } = useNavbarStyles();
  const router = useRouter();

  function attemptLogout() {
    performLogout();
    showNotification({
      color: 'green',
      title: 'Logout successful',
      message: '',
    });

    router.push('/login');
  }

  return (
    <Navbar.Section className={classes.footer}>
      <a href={`${getBaseApiUrl()}/docs`} className={classes.link}>
        <FaBook className={classes.linkIcon} size={20} />
        <span>API documentation</span>
      </a>

      <a href="https://github.com/evroon/bracket" className={classes.link}>
        <FaGithub className={classes.linkIcon} size={20} />
        <span>Bracket on GitHub</span>
      </a>

      <a href="#" className={classes.link} onClick={() => attemptLogout()}>
        <IconLogout className={classes.linkIcon} stroke={1.5} />
        <span>Logout</span>
      </a>
    </Navbar.Section>
  );
}
