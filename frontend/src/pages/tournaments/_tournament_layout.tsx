import React from 'react';

import { TournamentLinks } from '../../components/navbar/_main_links';
import { responseIsValid } from '../../components/utils/util';
import { checkForAuthError, getTournaments } from '../../services/adapter';
import Layout from '../_layout';

export default function TournamentLayout({ children, tournament_id }: any) {
  const tournamentResponse = getTournaments();
  checkForAuthError(tournamentResponse);

  const tournamentLinks = <TournamentLinks tournament_id={tournament_id} />;
  const breadcrumbs = responseIsValid(tournamentResponse) ? (
    <h2>/ {tournamentResponse.data.data[0].name}</h2>
  ) : null;

  return (
    <Layout additionalNavbarLinks={tournamentLinks} breadcrumbs={breadcrumbs}>
      {children}
    </Layout>
  );
}
