import { AppShell, Navbar, useMantineTheme } from '@mantine/core';

import { Brand } from '../../components/navbar/_brand';
import { MainLinks } from '../../components/navbar/_main_links';
import { User } from '../../components/navbar/_user';

export default function TournamentLayout({ children, tournament_id }: any) {
  const theme = useMantineTheme();

  return (
    <>
      <AppShell
        styles={{
          main: {
            background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={
          <Navbar p="xs" width={{ base: 300 }}>
            <Navbar.Section mt="md">
              <Brand />
            </Navbar.Section>
            <Navbar.Section grow mt="md">
              <MainLinks tournament_id={tournament_id} />
            </Navbar.Section>
            <Navbar.Section>
              <User />
            </Navbar.Section>
          </Navbar>
        }
      >
        {children}
      </AppShell>
    </>
  );
}
