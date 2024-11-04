import {
  Alert,
  Button,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Progress,
  Skeleton,
  Stack,
  Switch,
} from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { IoOptions } from '@react-icons/all-files/io5/IoOptions';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { MdOutlineAutoFixHigh } from 'react-icons/md';
import { SWRResponse } from 'swr';

import { BracketDisplaySettings } from '../../interfaces/brackets';
import { SchedulerSettings } from '../../interfaces/match';
import { RoundInterface } from '../../interfaces/round';
import { StageItemWithRounds, stageItemIsHandledAutomatically } from '../../interfaces/stage_item';
import { Tournament, TournamentMinimal } from '../../interfaces/tournament';
import { createRound } from '../../services/round';
import { AutoCreateMatchesButton } from '../buttons/create_matches_auto';
import ActivateNextRoundModal from '../modals/activate_next_round_modal';
import { NoContent } from '../no_content/empty_table_info';
import { Translator } from '../utils/types';
import { responseIsValid } from '../utils/util';
import Round from './round';

function AddRoundButton({
  t,
  tournamentData,
  stageItem,
  swrStagesResponse,
  size,
}: {
  t: Translator;
  tournamentData: TournamentMinimal;
  stageItem: StageItemWithRounds;
  swrStagesResponse: SWRResponse;
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
  swrCourtsResponse,
  swrUpcomingMatchesResponse,
  schedulerSettings,
  readOnly,
  displaySettings,
  draftRound,
}: {
  stageItem: StageItemWithRounds;
  tournamentData: Tournament;
  swrStagesResponse: SWRResponse;
  swrCourtsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  schedulerSettings: SchedulerSettings;
  readOnly: boolean;
  displaySettings: BracketDisplaySettings;
  draftRound: RoundInterface;
}) {
  const { t } = useTranslation();

  if (swrStagesResponse.isLoading) {
    return <LoadingSkeleton />;
  }
  if (!responseIsValid(swrStagesResponse)) {
    return <NoRoundsAlert readOnly={readOnly} />;
  }

  const items = stageItem.rounds
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

  let result: React.JSX.Element[] | React.JSX.Element = items;

  if (result.length < 1) {
    result = (
      <Container mt="1rem">
        <Stack align="center">
          <NoContent title={t('no_round_description')} />
          <AddRoundButton
            t={t}
            tournamentData={tournamentData}
            stageItem={stageItem}
            swrStagesResponse={swrStagesResponse}
            size="lg"
          />
        </Stack>
      </Container>
    );
  }

  const hideAddRoundButton =
    tournamentData == null || readOnly || stageItemIsHandledAutomatically(stageItem);

  const courtsCount = swrCourtsResponse.data?.data?.length || 0;
  const scheduledMatchesCount = draftRound?.matches.length;

  return (
    <React.Fragment key={stageItem.id}>
      <div style={{ width: '100%' }}>
        <Grid grow>
          <Grid.Col span={6} mb="2rem">
            <Group>
              <Center>
                {scheduledMatchesCount == null ? null : (
                  <>
                    <Stack gap="6px">
                      <>
                        {scheduledMatchesCount} / {courtsCount} {t('courts_filled_badge')}
                      </>
                      <Progress
                        value={(scheduledMatchesCount * 100) / courtsCount}
                        miw="12rem"
                        striped
                        color="indigo"
                      />
                    </Stack>
                    <Divider orientation="vertical" mx="1rem" />
                  </>
                )}
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
                <Divider orientation="vertical" mx="1rem" />
                <AutoCreateMatchesButton
                  swrStagesResponse={swrStagesResponse}
                  swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
                  tournamentData={tournamentData}
                  stageItemId={stageItem.id}
                  schedulerSettings={schedulerSettings}
                  displaySettings={displaySettings}
                />
              </Center>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group justify="right">
              {hideAddRoundButton ? null : (
                <AddRoundButton
                  t={t}
                  tournamentData={tournamentData}
                  stageItem={stageItem}
                  swrStagesResponse={swrStagesResponse}
                  size="md"
                />
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
