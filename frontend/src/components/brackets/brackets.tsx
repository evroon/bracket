import { Alert, Button, Container, Grid, Group, Skeleton } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import { RoundInterface } from '../../interfaces/round';
import { StageItemWithRounds, stageItemIsHandledAutomatically } from '../../interfaces/stage_item';
import { TournamentMinimal } from '../../interfaces/tournament';
import { createRound } from '../../services/round';
import ActivateNextRoundModal from '../modals/activate_next_round_modal';
import { Translator } from '../utils/types';
import { responseIsValid } from '../utils/util';
import Round from './round';

function getRoundsGridCols(
  t: Translator,
  stageItem: StageItemWithRounds,
  tournamentData: TournamentMinimal,
  swrStagesResponse: SWRResponse,
  swrUpcomingMatchesResponse: SWRResponse | null,
  readOnly: boolean,
  displaySettings: BracketDisplaySettings
) {
  let rounds: React.JSX.Element[] | React.JSX.Element = stageItem.rounds
    .sort((r1: any, r2: any) => (r1.name > r2.name ? 1 : -1))
    .map((round: RoundInterface) => (
      <Round
        key={round.id}
        tournamentData={tournamentData}
        round={round}
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        readOnly={readOnly}
        dynamicSchedule={!stageItemIsHandledAutomatically(stageItem)}
        displaySettings={displaySettings}
      />
    ));

  if (rounds.length < 1) {
    rounds = (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={t('no_round_title')}
        color="blue"
        radius="lg"
      >
        {t('no_round_description')}
      </Alert>
    );
  }

  const hideAddRoundButton =
    tournamentData == null || readOnly || stageItemIsHandledAutomatically(stageItem);

  return (
    <React.Fragment key={stageItem.id}>
      <div style={{ width: '100%' }}>
        <Grid grow>
          <Grid.Col span={6}></Grid.Col>
          <Grid.Col span={6}>
            <Group justify="right">
              {hideAddRoundButton ? null : (
                <Button
                  color="green"
                  size="md"
                  leftSection={<GoPlus size={24} />}
                  variant="outline"
                  onClick={async () => {
                    await createRound(tournamentData.id, stageItem.id);
                    await swrStagesResponse.mutate();
                  }}
                >
                  {t('add_round_button')}
                </Button>
              )}
              {hideAddRoundButton ? null : (
                <ActivateNextRoundModal
                  tournamentId={tournamentData.id}
                  swrStagesResponse={swrStagesResponse}
                  stageItem={stageItem}
                />
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </div>
      <Group align="top">{rounds}</Group>
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

export default function Brackets({
  tournamentData,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  readOnly,
  displaySettings,
  stageItem,
}: {
  tournamentData: TournamentMinimal;
  swrStagesResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse | null;
  readOnly: boolean;
  displaySettings: BracketDisplaySettings;
  stageItem: StageItemWithRounds;
}) {
  const { t } = useTranslation();

  if (swrStagesResponse.isLoading) {
    return <LoadingSkeleton />;
  }
  if (!swrStagesResponse.isLoading && !responseIsValid(swrStagesResponse)) {
    return <NoRoundsAlert readOnly={readOnly} />;
  }

  if (swrStagesResponse.isLoading) {
    return <LoadingSkeleton />;
  }

  const rounds = getRoundsGridCols(
    t,
    stageItem,
    tournamentData,
    swrStagesResponse,
    swrUpcomingMatchesResponse,
    readOnly,
    displaySettings
  );

  return <div>{rounds}</div>;
}
