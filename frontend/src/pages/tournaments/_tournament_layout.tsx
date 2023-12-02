import { AppShell } from '@mantine/core';
import React from 'react';

import { MainLinks } from '../../components/navbar/_main_links';
import { checkForAuthError, getTournaments } from '../../services/adapter';
import Layout from '../_layout';

function NavBar({ links }: any) {
  return (
    <AppShell.Navbar p="md">
      {links == null ? (
        <AppShell.Section grow>
          <div />
        </AppShell.Section>
      ) : (
        links
      )}
    </AppShell.Navbar>
  );
}

export default function TournamentLayout({ children, tournament_id }: any) {
  const tournament = getTournaments();
  checkForAuthError(tournament);
  const links = (
    <AppShell.Section grow>
      <MainLinks tournament_id={tournament_id} />
    </AppShell.Section>
  );

  return (
    <>
      <Layout navbar={<NavBar links={links} />}>{children}</Layout>
    </>
  );
}
