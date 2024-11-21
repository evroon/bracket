import { Button, Container, Grid, Group, SegmentedControl, Stack, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import React from 'react';
import { LuNavigation } from 'react-icons/lu';
import { SWRResponse } from 'swr';

import NotFoundTitle from '../../../../404';
import { RoundsGridCols } from '../../../../../components/brackets/brackets';
import { NoContent } from '../../../../../components/no_content/empty_table_info';
import Scheduler from '../../../../../components/scheduling/scheduling';
import classes from '../../../../../components/utility.module.css';
import { useRouterQueryState } from '../../../../../components/utils/query_parameters';
import { Translator } from '../../../../../components/utils/types';
import {
  getStageItemIdFromRouter,
  getTournamentIdFromRouter,
  responseIsValid,
} from '../../../../../components/utils/util';
import { BracketDisplaySettings } from '../../../../../interfaces/brackets';
import { SchedulerSettings } from '../../../../../interfaces/match';
import { RoundInterface } from '../../../../../interfaces/round';
import { getStageById } from '../../../../../interfaces/stage';
import { Tournament } from '../../../../../interfaces/tournament';
import {
  checkForAuthError,
  getCourts,
  getStages,
  getTournamentById,
  getUpcomingMatches,
} from '../../../../../services/adapter';
import { getStageItemLookup } from '../../../../../services/lookups';
import TournamentLayout from '../../../_tournament_layout';

export const getServerSideProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

function NoCourtsButton({ t, tournamentData }: { t: Translator; tournamentData: Tournament }) {
  return (
    <Stack align="center">
      <NoContent title={t('no_courts_title')} description={t('no_courts_description_swiss')} />
      <Button
        color="green"
        size="lg"
        leftSection={<LuNavigation size={24} />}
        variant="outline"
        component={Link}
        className={classes.mobileLink}
        href={`/tournaments/${tournamentData.id}/schedule`}
      >
        {t('go_to_courts_page')}
      </Button>
    </Stack>
  );
}

export default function TournamentPage() {
  const { id, tournamentData } = getTournamentIdFromRouter();
  const stageItemId = getStageItemIdFromRouter();
  const { t } = useTranslation();

  const swrTournamentResponse = getTournamentById(tournamentData.id);
  checkForAuthError(swrTournamentResponse);
  const swrStagesResponse: SWRResponse = getStages(id);
  const swrCourtsResponse = getCourts(tournamentData.id);
  const [onlyRecommended, setOnlyRecommended] = useRouterQueryState('only-recommended', 'true');
  const [eloThreshold, setEloThreshold] = useRouterQueryState('max-elo-diff', 200);
  const [iterations, setIterations] = useRouterQueryState('iterations', 2_000);
  const [limit, setLimit] = useRouterQueryState('limit', 50);
  const [matchVisibility, setMatchVisibility] = useRouterQueryState('match-visibility', 'all');
  const [teamNamesDisplay, setTeamNamesDisplay] = useRouterQueryState('which-names', 'team-names');
  const [showAdvancedSchedulingOptions, setShowAdvancedSchedulingOptions] = useRouterQueryState(
    'advanced',
    'false'
  );
  const displaySettings: BracketDisplaySettings = {
    matchVisibility,
    setMatchVisibility,
    teamNamesDisplay,
    setTeamNamesDisplay,
    showManualSchedulingOptions: showAdvancedSchedulingOptions,
    setShowManualSchedulingOptions: setShowAdvancedSchedulingOptions,
  };

  const schedulerSettings: SchedulerSettings = {
    eloThreshold,
    setEloThreshold,
    onlyRecommended,
    setOnlyRecommended,
    limit,
    setLimit,
    iterations,
    setIterations,
  };

  const tournamentDataFull =
    swrTournamentResponse.data != null ? swrTournamentResponse.data.data : null;

  let activeStage = null;
  let draftRound = null;
  let stageItem = null;

  if (responseIsValid(swrStagesResponse) && stageItemId != null) {
    stageItem = getStageItemLookup(swrStagesResponse)[stageItemId];
    [activeStage] = getStageById(swrStagesResponse, stageItem.stage_id);

    if (activeStage != null && activeStage.stage_items != null) {
      const draftRounds = stageItem.rounds.filter(
        (round: RoundInterface) => round.stage_item_id === stageItemId && round.is_draft
      );

      if (draftRounds != null && draftRounds.length > 0) {
        [draftRound] = draftRounds;
      }
    }
  }

  const swrUpcomingMatchesResponse = getUpcomingMatches(
    id,
    stageItemId,
    draftRound,
    schedulerSettings
  );
  const showScheduler =
    draftRound != null &&
    stageItem != null &&
    activeStage != null &&
    displaySettings.showManualSchedulingOptions === 'true' &&
    swrUpcomingMatchesResponse != null;

  if (!swrTournamentResponse.isLoading && tournamentDataFull == null) {
    return <NotFoundTitle />;
  }

  if (!swrCourtsResponse.isLoading && swrCourtsResponse.data.data.length < 1) {
    return (
      <TournamentLayout tournament_id={tournamentData.id}>
        <Container mt="1rem">
          <Stack align="center">
            <NoCourtsButton t={t} tournamentData={tournamentDataFull} />
          </Stack>
        </Container>
      </TournamentLayout>
    );
  }

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <Grid grow>
        <Grid.Col span={6}>
          <Title>{stageItem != null ? stageItem.name : ''}</Title>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group justify="right">
            <SegmentedControl
              className={classes.fullWithMobile}
              value={matchVisibility}
              onChange={setMatchVisibility}
              data={[
                { label: t('match_filter_option_all'), value: 'all' },
                { label: t('match_filter_option_past'), value: 'future-only' },
                { label: t('match_filter_option_current'), value: 'present-only' },
              ]}
            />
            {tournamentDataFull?.dashboard_endpoint && (
              <Button
                className={classes.fullWithMobile}
                color="blue"
                size="sm"
                variant="outline"
                leftSection={<IconExternalLink size={24} />}
                onClick={() => {
                  window.open(
                    `/tournaments/${tournamentDataFull.dashboard_endpoint}/dashboard`,
                    '_ blank'
                  );
                }}
              >
                {t('view_dashboard_button')}
              </Button>
            )}
          </Group>
        </Grid.Col>
      </Grid>
      <div style={{ marginTop: '1rem', marginLeft: '1rem', marginRight: '1rem' }}>
        <RoundsGridCols
          tournamentData={tournamentDataFull}
          swrStagesResponse={swrStagesResponse}
          readOnly={false}
          stageItem={stageItem}
          displaySettings={displaySettings}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        />
        {showScheduler ? (
          <Scheduler
            activeStage={activeStage}
            draftRound={draftRound}
            tournamentData={tournamentDataFull}
            swrStagesResponse={swrStagesResponse}
            swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
            swrCourtsResponse={swrCourtsResponse}
            schedulerSettings={schedulerSettings}
          />
        ) : null}
      </div>
    </TournamentLayout>
  );
}
