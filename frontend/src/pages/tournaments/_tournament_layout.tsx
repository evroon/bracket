import { Group, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { HiArchiveBoxArrowDown } from 'react-icons/hi2';
import { useLocation } from 'react-router';

import { TournamentLinks } from '@components/navbar/_main_links';
import { capitalize, responseIsValid } from '@components/utils/util';
import Layout from '@pages/_layout';
import { checkForAuthError, getTournamentById } from '@services/adapter';

const SECTION_LABELS: Record<string, string> = {
  stages: 'stage_title',
  players: 'players_title',
  teams: 'teams_title',
  schedule: 'planning_title',
  results: 'results_title',
  rankings: 'rankings_title',
  settings: 'tournament_setting_title',
  dashboard: 'view_dashboard_button',
};

export default function TournamentLayout({ children, tournament_id }: any) {
  const { t } = useTranslation();
  const location = useLocation();

  const tournamentResponse = getTournamentById(tournament_id);
  checkForAuthError(tournamentResponse);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentSection = pathSegments[pathSegments.length - 1];
  const sectionKey = SECTION_LABELS[currentSection];

  const tournamentLinks = <TournamentLinks tournament_id={tournament_id} />;
  const breadcrumbs = responseIsValid(tournamentResponse) ? (
    <Group gap="xs" miw="25rem">
      <Title order={2} maw="20rem">
        /
      </Title>
      <Title order={2} maw="20rem" lineClamp={1}>
        {tournamentResponse.data?.data.name}
      </Title>

      {sectionKey && (
        <>
          <Title order={2} maw="10rem">
            /
          </Title>
          <Title order={2} maw="15rem" lineClamp={1}>
            {capitalize(t(sectionKey))}
          </Title>
        </>
      )}

      <Tooltip label={`${t('archived_header_label')}`}>
        <ThemeIcon
          color="yellow"
          variant="light"
          style={{
            visibility: tournamentResponse.data?.data.status === 'ARCHIVED' ? 'visible' : 'hidden',
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
