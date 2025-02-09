import { Group, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { HiArchiveBoxArrowDown } from 'react-icons/hi2';

import { TournamentLinks } from '../../components/navbar/_main_links';
import { responseIsValid } from '../../components/utils/util';
import { checkForAuthError, getTournamentById } from '../../services/adapter';
import Layout from '../_layout';

export default function TournamentLayout({ children, tournament_id }: any) {
  const { t } = useTranslation();

  const tournamentResponse = getTournamentById(tournament_id);
  checkForAuthError(tournamentResponse);

  const tournamentLinks = <TournamentLinks tournament_id={tournament_id} />;
  const breadcrumbs = responseIsValid(tournamentResponse) ? (
    <Group gap="xs" miw="25rem">
      <Title order={2} maw="20rem">
        /
      </Title>
      <Title order={2} maw="20rem" lineClamp={1}>
        {tournamentResponse.data.data.name}
      </Title>

      <Tooltip label={`${t('archived_header_label')}`}>
        <ThemeIcon
          color="yellow"
          variant="light"
          style={{
            visibility: tournamentResponse.data.data.status === 'ARCHIVED' ? 'visible' : 'hidden',
          }}
        >
          <HiArchiveBoxArrowDown />
        </ThemeIcon>
      </Tooltip>
    </Group>
  ) : null;

  return (
    <Layout additionalNavbarLinks={tournamentLinks} breadcrumbs={breadcrumbs}>
      {children}
    </Layout>
  );
}
