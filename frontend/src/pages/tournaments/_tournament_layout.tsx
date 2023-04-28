import { Navbar } from '@mantine/core';
import React, { useState } from 'react';

import { MainLinks } from '../../components/navbar/_main_links';
import { checkForAuthError, getTournaments } from '../../services/adapter';
import Layout from '../_layout';

function NavBar({ navBarOpened, links }: any) {
  return (
    <Navbar p="md" width={{ base: 80 }} hidden={!navBarOpened} hiddenBreakpoint="sm">
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
  const [navBarOpened] = useState(false);
  checkForAuthError(tournament);
  const links = (
    <Navbar.Section grow>
      <MainLinks tournament_id={tournament_id} />
    </Navbar.Section>
  );

  return (
    <>
      <Layout links={links} navbar={<NavBar navBarOpened={navBarOpened} links={links} />}>
        {children}
      </Layout>
    </>
  );
}
