import { Button, Grid, Group, SegmentedControl, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import { RoundsGridCols } from '@components/brackets/brackets';
import classes from '@components/utility.module.css';
import { BracketDisplaySettings } from '@components/utils/brackets';
import { getStageById } from '@components/utils/stage';
import {
  getStageItemIdFromRouter,
  getTournamentIdFromRouter,
  responseIsValid,
} from '@components/utils/util';
import NotFoundTitle from '@pages/404';
import TournamentLayout from '@pages/tournaments/_tournament_layout';
import { checkForAuthError, getStages, getTournamentById, getUpcomingMatches } from '@services/adapter';
import { getStageItemLookup } from '@services/lookups';

export default function EliminationBracketPage() {
  const { id, tournamentData } = getTournamentIdFromRouter();
  const stageItemId = getStageItemIdFromRouter();
  const { t } = useTranslation();

  const swrTournamentResponse = getTournamentById(tournamentData.id);
  checkForAuthError(swrTournamentResponse);
  const swrStagesResponse: SWRResponse = getStages(id);

  const [matchVisibility, setMatchVisibility] = useQueryState(
    'match-visibility',
    parseAsString.withDefault('all')
  );
  const [teamNamesDisplay, setTeamNamesDisplay] = useQueryState(
    'which-names',
    parseAsString.withDefault('team-names')
  );
  const [showManualSchedulingOptions, setShowManualSchedulingOptions] = useQueryState(
    'manual',
    parseAsString.withDefault('false')
  );

  const displaySettings: BracketDisplaySettings = {
    matchVisibility,
    setMatchVisibility,
    teamNamesDisplay,
    setTeamNamesDisplay,
    showManualSchedulingOptions,
    setShowManualSchedulingOptions,
  };

  const tournamentDataFull = swrTournamentResponse.data?.data;

  let stageItem = null;

  if (responseIsValid(swrStagesResponse) && stageItemId != null) {
    stageItem = getStageItemLookup(swrStagesResponse)[stageItemId];
  }

  const swrUpcomingMatchesResponse = getUpcomingMatches(id, stageItemId, null, null);

  if (!swrTournamentResponse.isLoading && tournamentDataFull == null) {
    return <NotFoundTitle />;
  } else if (tournamentDataFull == null) {
    return null;
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
      </div>
    </TournamentLayout>
  );
}
