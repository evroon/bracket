import { AppShell, Burger, Header, MediaQuery, Navbar, useMantineTheme } from '@mantine/core';
import { useState } from 'react';

import { Brand } from '../components/navbar/_brand';
import { User } from '../components/navbar/_user';

export default function Layout({ children, links }: any) {
  const theme = useMantineTheme();
  const [navBarOpened, setNavBarOpened] = useState(false);

  return (
    <>
      <MediaQuery
        largerThan="md"
        styles={{
          '--mantine-header-height': '0px',
        }}
      >
        <AppShell
          fixed
          styles={{
            main: {
              background:
                theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
            },
          }}
          padding="md"
          navbarOffsetBreakpoint="md"
          header={
            <MediaQuery
              largerThan="md"
              styles={{
                display: 'none',
                '--mantine-header-height': '0px',
              }}
            >
              <Header height={70} p="md">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <Burger
                    opened={navBarOpened}
                    onClick={() => setNavBarOpened((o) => !o)}
                    size="sm"
                    color={theme.colors.gray[6]}
                    mr="xl"
                  />
                </div>
              </Header>
            </MediaQuery>
          }
          navbar={
            <Navbar
              p="md"
              width={{ sm: 300, lg: 300 }}
              hidden={!navBarOpened}
              hiddenBreakpoint="md"
            >
              <Navbar.Section mt="md">
                <Brand />
              </Navbar.Section>
              {links == null ? (
                <Navbar.Section grow>
                  <div />
                </Navbar.Section>
              ) : (
                links
              )}
              <Navbar.Section>
                <User />
              </Navbar.Section>
            </Navbar>
          }
        >
          {children}
        </AppShell>
      </MediaQuery>
    </>
  );
}
