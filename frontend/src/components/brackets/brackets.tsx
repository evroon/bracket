import {
  Alert,
  Button,
  Center,
  Container,
  Grid,
  Group,
  Skeleton,
  Stack,
  Switch,
} from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { IoOptions } from '@react-icons/all-files/io5/IoOptions';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineAutoFixHigh } from 'react-icons/md';
import { SWRResponse } from 'swr';

import ActivateNextRoundModal from '@components/modals/activate_next_round_modal';
import { NoContent } from '@components/no_content/empty_table_info';
import { BracketDisplaySettings } from '@components/utils/brackets';
import { TournamentMinimal } from '@components/utils/tournament';
import { Translator } from '@components/utils/types';
import { responseIsValid } from '@components/utils/util';
import {
  RoundWithMatches,
  StageItemWithRounds,
  StagesWithStageItemsResponse,
  Tournament,
  UpcomingMatchesResponse,
} from '@openapi';
import { createRound } from '@services/round';
import { DoubleEliminationBracket } from './double_elimination_bracket';
import RoundComponent from './round';

function AddRoundButton({
  t,
  tournamentData,
  stageItem,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  size,
}: {
  t: Translator;
  tournamentData: TournamentMinimal;
  stageItem: StageItemWithRounds;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse>;
  size: 'md' | 'lg';
}) {
  return (
    <Button
      color="green"
      size={size}
      leftSection={<GoPlus size={24} />}
      variant="outline"
      onClick={async () => {
        await createRound(tournamentData.id, stageItem.id);
        await swrStagesResponse.mutate();
        await swrUpcomingMatchesResponse.mutate();
      }}
    >
      {t('add_round_button')}
    </Button>
  );
}

export function RoundsGridCols({
  stageItem,
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  displaySettings,
}: {
  stageItem: StageItemWithRounds;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrUpcomingMatchesResponse: SWRResponse<UpcomingMatchesResponse>;
  readOnly: boolean;
  displaySettings: BracketDisplaySettings;
}) {
  const { t } = useTranslation();

  if (swrStagesResponse.isLoading) {
    return <LoadingSkeleton />;
  }
  if (!responseIsValid(swrStagesResponse)) {
    return <NoRoundsAlert readOnly={readOnly} />;
  }

  // Use specialized component for double elimination brackets
  if (stageItem.type === 'DOUBLE_ELIMINATION') {
    return (
      <DoubleEliminationBracket
        stageItem={stageItem}
        tournamentData={tournamentData}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
        displaySettings={displaySettings}
      />
    );
  }

  let result: React.JSX.Element[] | React.JSX.Element = stageItem.rounds
    .sort((r1: any, r2: any) => (r1.name > r2.name ? 1 : -1))
    .filter(
      (round: RoundWithMatches) =>
        round.matches.length > 0 || displaySettings.matchVisibility === 'all'
    )
    .map((round: RoundWithMatches) => (
      <RoundComponent
        key={round.id}
        tournamentData={tournamentData}
        round={round}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
        displaySettings={displaySettings}
      />
    ));

  if (result.length < 1) {
    if (stageItem.rounds.length < 1) {
      result = (
        <Container mt="1rem">
          <Stack align="center">
            <NoContent title={t('no_round_description')} />
            {stageItem.rounds.length < 1 && (
              <AddRoundButton
                t={t}
                tournamentData={tournamentData}
                stageItem={stageItem}
                swrStagesResponse={swrStagesResponse}
                swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
                size="lg"
              />
            )}
          </Stack>
        </Container>
      );
    } else {
      result = (
        <Container mt="1rem">
          <Stack align="center">
            <NoContent title={t('no_round_found_title')} />
          </Stack>
        </Container>
      );
    }
  }

  const hideAddRoundButton = tournamentData == null || readOnly;

  return (
    <React.Fragment key={stageItem.id}>
      <div style={{ width: '100%' }}>
        <Grid grow>
          <Grid.Col span={6} mb="2rem">
            <Group>
              <Center>
                <Switch
                  size="md"
                  onLabel={<MdOutlineAutoFixHigh size={16} />}
                  offLabel={<IoOptions size={16} />}
                  checked={displaySettings.showManualSchedulingOptions === 'false'}
                  label={
                    displaySettings.showManualSchedulingOptions === 'true' ? 'Manual' : 'Automatic'
                  }
                  color="indigo"
                  onChange={(event) => {
                    displaySettings.setShowManualSchedulingOptions(
                      event.currentTarget.checked ? 'false' : 'true'
                    );
                  }}
                  miw="9rem"
                />
              </Center>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group justify="right">
              {hideAddRoundButton ||
              displaySettings.showManualSchedulingOptions === 'false' ? null : (
                <AddRoundButton
                  t={t}
                  tournamentData={tournamentData}
                  stageItem={stageItem}
                  swrStagesResponse={swrStagesResponse}
                  swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
                  size="md"
                />
              )}
              {hideAddRoundButton ||
              displaySettings.showManualSchedulingOptions === 'true' ? null : (
                <ActivateNextRoundModal
                  tournamentId={tournamentData.id}
                  swrStagesResponse={swrStagesResponse}
                  swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
                  stageItem={stageItem}
                />
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </div>
      <Group align="top">{result}</Group>
    </React.Fragment>
  );
}

function NoRoundsAlert({ readOnly }: { readOnly: boolean }) {
  const { t } = useTranslation();
  if (readOnly) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={t('no_round_found_title')}
        color="blue"
        radius="lg"
      >
        {t('no_round_found_description')}
      </Alert>
    );
  }
  return (
    <Container>
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={t('no_round_found_title')}
        color="blue"
        radius="lg"
      >
        {t('no_round_found_in_stage_description')}
      </Alert>
    </Container>
  );
}

function LoadingSkeleton() {
  return (
    <Group>
      <div style={{ width: '400px', marginLeft: '1rem' }}>
        <Skeleton height={500} mb="xl" radius="xl" />
      </div>
      <div style={{ width: '400px', marginLeft: '1rem' }}>
        <Skeleton height={500} mb="xl" radius="xl" />
      </div>
    </Group>
  );
}
