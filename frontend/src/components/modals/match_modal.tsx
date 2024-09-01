import {
  Button,
  Center,
  Checkbox,
  Divider,
  Grid,
  Input,
  Modal,
  NumberInput,
  Text,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { format, fromUnixTime, getUnixTime, parseISO } from 'date-fns';
import { useTranslation } from 'next-i18next';
import React, { useMemo, useState } from 'react';
import { SWRResponse } from 'swr';

import {
  MatchBodyInterface,
  MatchInterface,
  formatMatchTeam1,
  formatMatchTeam2,
} from '../../interfaces/match';
import { TournamentMinimal } from '../../interfaces/tournament';
import { getMatchLookup, getStageItemLookup } from '../../services/lookups';
import { deleteMatch, updateMatch } from '../../services/match';
import DeleteButton from '../buttons/delete';

interface MatchModalBaseProps {
  tournamentData: TournamentMinimal;
  swrUpcomingMatchesResponse: SWRResponse | null;
  dynamicSchedule: boolean;
}

interface MatchModalProps extends MatchModalBaseProps {
  match: MatchInterface | null;
  swrStagesResponse: SWRResponse;
  setOpened: (value: boolean) => void;
  priorMatch: MatchInterface | null;
}

/**
 * A typical implementation for opening a match modal. Useful for other components, especially in pages.
 */
export type OpenMatchModalFn = (match: MatchInterface, priorMatch: MatchInterface | null) => void;

function MatchDeleteButton({
  tournamentData,
  match,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  dynamicSchedule,
}: MatchModalBaseProps & {
  match: MatchInterface;
  swrRoundsResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  if (!dynamicSchedule) return null;
  return (
    <DeleteButton
      fullWidth
      onClick={async () => {
        await deleteMatch(tournamentData.id, match.id);
        await swrRoundsResponse.mutate();
        if (swrUpcomingMatchesResponse != null) await swrUpcomingMatchesResponse.mutate();
      }}
      style={{ marginTop: '1rem' }}
      size="sm"
      title={t('remove_match_button')}
    />
  );
}

function MatchModalForm({
  tournamentData,
  match,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  setOpened,
  dynamicSchedule,
  priorMatch,
}: MatchModalProps) {
  if (match == null) {
    return null;
  }

  const { t } = useTranslation();
  const form = useForm({
    initialValues: {
      team1_score: match.team1_score,
      team2_score: match.team2_score,
      custom_duration_minutes: match.custom_duration_minutes,
      custom_margin_minutes: match.custom_margin_minutes,
    },

    validate: {
      team1_score: (value) => (value >= 0 ? null : t('negative_score_validation')),
      team2_score: (value) => (value >= 0 ? null : t('negative_score_validation')),
      custom_duration_minutes: (value) =>
        value == null || value >= 0 ? null : t('negative_match_duration_validation'),
      custom_margin_minutes: (value) =>
        value == null || value >= 0 ? null : t('negative_match_margin_validation'),
    },
  });

  const [customDurationEnabled, setCustomDurationEnabled] = useState(
    match.custom_duration_minutes != null
  );
  const [customMarginEnabled, setCustomMarginEnabled] = useState(
    match.custom_margin_minutes != null
  );

  const [date, setDate] = useState<Date | null>(null);

  const matchDuration = useMemo(() => {
    const value = customDurationEnabled
      ? form.values.custom_duration_minutes
      : match.duration_minutes;
    return value ?? 0;
  }, [customDurationEnabled, form.values.custom_duration_minutes, match.duration_minutes]);

  const matchMargin = useMemo(() => {
    const value = customMarginEnabled ? form.values.custom_margin_minutes : match.margin_minutes;
    return value ?? 0;
  }, [customMarginEnabled, form.values.custom_margin_minutes, match.margin_minutes]);

  const endDatetime = useMemo(
    () =>
      fromUnixTime(getUnixTime(parseISO(match.start_time)) + matchDuration * 60 + matchMargin * 60),
    [match.start_time, matchDuration, matchMargin]
  );

  const stageItemsLookup = getStageItemLookup(swrStagesResponse);
  const matchesLookup = getMatchLookup(swrStagesResponse);

  const team1Name = formatMatchTeam1(stageItemsLookup, matchesLookup, match);
  const team2Name = formatMatchTeam2(stageItemsLookup, matchesLookup, match);

  return (
    <>
      <form
        onSubmit={form.onSubmit(async (values) => {
          const updatedMatch: MatchBodyInterface = {
            id: match.id,
            round_id: match.round_id,
            team1_score: values.team1_score,
            team2_score: values.team2_score,
            court_id: match.court_id,
            custom_duration_minutes: customDurationEnabled ? values.custom_duration_minutes : null,
            custom_margin_minutes: customMarginEnabled ? values.custom_margin_minutes : null,
          };
          await updateMatch(tournamentData.id, match.id, updatedMatch);
          await swrStagesResponse.mutate();
          if (swrUpcomingMatchesResponse != null) await swrUpcomingMatchesResponse.mutate();
          setOpened(false);
        })}
      >
        <NumberInput
          withAsterisk
          label={`${t('score_of_label')} ${team1Name}`}
          placeholder={`${t('score_of_label')} ${team1Name}`}
          {...form.getInputProps('team1_score')}
        />
        <NumberInput
          withAsterisk
          mt="xs"
          label={`${t('score_of_label')} ${team2Name}`}
          placeholder={`${t('score_of_label')} ${team2Name}`}
          {...form.getInputProps('team2_score')}
        />

        <Divider mt="lg" mb="xs" />

        <Grid align="center">
          <Grid.Col span={{ sm: 8 }}>
            <NumberInput
              label={t('custom_match_duration_label')}
              disabled={!customDurationEnabled}
              rightSection={<Text>{t('minutes')}</Text>}
              placeholder={`${match.duration_minutes}`}
              rightSectionWidth={92}
              {...form.getInputProps('custom_duration_minutes')}
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 4 }}>
            <Input.Label />
            <Center>
              <Checkbox
                checked={customDurationEnabled}
                label={t('customize_checkbox_label')}
                onChange={(event) => {
                  setCustomDurationEnabled(event.currentTarget.checked);
                }}
              />
            </Center>
          </Grid.Col>
        </Grid>

        <Grid align="center">
          <Grid.Col span={{ sm: 8 }}>
            <NumberInput
              label={t('custom_match_margin_label')}
              disabled={!customMarginEnabled}
              placeholder={`${match.margin_minutes}`}
              rightSection={<Text>{t('minutes')}</Text>}
              rightSectionWidth={92}
              {...form.getInputProps('custom_margin_minutes')}
            />
          </Grid.Col>
          <Grid.Col span={{ sm: 4 }}>
            <Input.Label />
            <Center>
              <Checkbox
                checked={customMarginEnabled}
                label={t('customize_checkbox_label')}
                onChange={(event) => {
                  setCustomMarginEnabled(event.currentTarget.checked);
                }}
              />
            </Center>
          </Grid.Col>
        </Grid>

        <Input.Wrapper label={t('next_match_time_label')} mt="sm">
          <Input component="time" dateTime={endDatetime.toISOString()}>
            {format(endDatetime, 'd LLLL yyyy HH:mm')}
          </Input>
        </Input.Wrapper>

        {priorMatch && (
          <>
            <Divider mt="lg" mb="xs" />

            <Grid align="center">
              <Grid.Col span={{ sm: 8 }}>
                <DateTimePicker
                  label={t('calculate_datetime_match_label')}
                  clearable
                  value={date}
                  onChange={setDate}
                />
              </Grid.Col>
              <Grid.Col span={{ sm: 4 }}>
                <Input.Label />
                <Button
                  display="block"
                  w="100%"
                  disabled={date === null}
                  onClick={async () => {
                    const computedMargin = Math.floor(
                      (date!.getTime() -
                        parseISO(priorMatch.start_time).getTime() +
                        (priorMatch.custom_duration_minutes === null
                          ? priorMatch.duration_minutes
                          : priorMatch.custom_duration_minutes) *
                          60 *
                          1000) /
                        60 /
                        1000
                    );

                    if (computedMargin < 0) {
                      showNotification({
                        message: '',
                        title: t('negative_match_margin_validation'),
                        color: 'red',
                        // icon: <IconAlert />,
                      });
                      return;
                    }

                    const updatedMatch = {
                      ...priorMatch,
                      custom_margin_minutes: computedMargin,
                    };

                    await updateMatch(tournamentData.id, priorMatch.id, updatedMatch);
                    await swrStagesResponse.mutate();
                  }}
                >
                  {t('calculate_label')}
                </Button>
              </Grid.Col>
            </Grid>
          </>
        )}

        <Button fullWidth style={{ marginTop: 20 }} color="green" type="submit">
          {t('save_button')}
        </Button>
      </form>
      <MatchDeleteButton
        swrRoundsResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
        tournamentData={tournamentData}
        match={match}
        dynamicSchedule={dynamicSchedule}
      />
    </>
  );
}

export default function MatchModal({
  tournamentData,
  match,
  swrStagesResponse,
  swrUpcomingMatchesResponse,
  opened,
  setOpened,
  dynamicSchedule,
  priorMatch,
}: MatchModalProps & {
  opened: boolean;
}) {
  const { t } = useTranslation();

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('edit_match_modal_title')}>
        <MatchModalForm
          swrStagesResponse={swrStagesResponse}
          swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
          tournamentData={tournamentData}
          match={match}
          setOpened={setOpened}
          dynamicSchedule={dynamicSchedule}
          priorMatch={priorMatch}
        />
      </Modal>
    </>
  );
}
