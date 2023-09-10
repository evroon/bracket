import { Navbar } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';

import { MainLinks } from '../../components/navbar/_main_links';
import { checkForAuthError, getTournaments } from '../../services/adapter';
import Layout from '../_layout';

function NavBar({ navBarOpened, links }: any) {
  return (
    <Navbar p="md" width={{ sm: 80 }} hidden={!navBarOpened} hiddenBreakpoint="sm">
      {links == null ? (
        <Navbar.Section grow>
          <div />
        </Navbar.Section>
      ) : (
        links
      )}
    </Navbar>
  );
}

export default function TournamentLayout({ children, tournament_id }: any) {
  const tournament = getTournaments();
  const disclosure = useDisclosure(false);
  const [opened] = disclosure;
  checkForAuthError(tournament);
  const links = (
    <Navbar.Section grow>
      <MainLinks tournament_id={tournament_id} />
    </Navbar.Section>
  );

  return (
    <>
      <Layout navbarState={disclosure} navbar={<NavBar navBarOpened={opened} links={links} />}>
        {children}
      </Layout>
    </>
  );
}
