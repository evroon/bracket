import {
  ActionIcon,
  Button,
  Divider,
  Grid,
  Input,
  Modal,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { parseISO } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { MatchInterface } from '../../interfaces/match';
import { updateMatch } from '../../services/match';
import CommonCustomTimeMatchesForm from '../forms/common_custom_times_matches';

export default function MatchUpdateModal({
  tournament_id,
  match,
  swrMatchResponse,
  previousMatch,
}: {
  tournament_id: number;
  match: MatchInterface;
  swrMatchResponse: SWRResponse;
  previousMatch?: MatchInterface;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      custom_duration_minutes: match.custom_duration_minutes,
      custom_margin_minutes: match.custom_margin_minutes,
    },
    validate: {
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

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title={t('edit_match_modal_title')}>
        <form
          onSubmit={form.onSubmit(async (values) => {
            const updatedMatch = {
              ...match,
              custom_duration_minutes: customDurationEnabled
                ? values.custom_duration_minutes
                : null,
              custom_margin_minutes: customMarginEnabled ? values.custom_margin_minutes : null,
            };

            await updateMatch(tournament_id, match.id, updatedMatch);
            await swrMatchResponse.mutate();
            setOpened(false);
          })}
        >
          <CommonCustomTimeMatchesForm
            customDurationEnabled={customDurationEnabled}
            customMarginEnabled={customMarginEnabled}
            form={form}
            match={match}
            setCustomDurationEnabled={setCustomDurationEnabled}
            setCustomMarginEnabled={setCustomMarginEnabled}
          />

          {previousMatch && (
            <>
              <Divider mt="sm" />

              <Grid align="center" mt="sm">
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
                          parseISO(previousMatch.start_time).getTime() +
                          (previousMatch.custom_duration_minutes === null
                            ? previousMatch.duration_minutes
                            : previousMatch.custom_duration_minutes) *
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
                        ...previousMatch,
                        custom_margin_minutes: computedMargin,
                      };

                      await updateMatch(tournament_id, previousMatch.id, updatedMatch);
                      await swrMatchResponse.mutate();
                    }}
                  >
                    {t('calculate_label')}
                  </Button>
                </Grid.Col>
              </Grid>
            </>
          )}

          <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Modal>

      <ActionIcon color="green" radius="lg" size={26} onClick={() => setOpened(true)}>
        <BiEditAlt size={20} />
      </ActionIcon>
    </>
  );
}
