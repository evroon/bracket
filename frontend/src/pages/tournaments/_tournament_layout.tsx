import { Navbar } from '@mantine/core';

import { MainLinks } from '../../components/navbar/_main_links';
import { checkForAuthError, getTournaments } from '../../services/adapter';
import Layout from '../_layout';

export default function TournamentLayout({ children, tournament_id }: any) {
  const tournament = getTournaments();
  checkForAuthError(tournament);
  const links = (
    <Navbar.Section grow>
      <MainLinks tournament_id={tournament_id} />
    </Navbar.Section>
  );

  return (
    <>
      <Layout links={links}>{children}</Layout>
    </>
  );
}
