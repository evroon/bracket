import { Center, Checkbox, Grid, Input, NumberInput, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { format, fromUnixTime, getUnixTime, parseISO } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import { MatchInterface } from '../../interfaces/match';

interface CommonCustomTimeMatchesFormProps<ExtendedObj extends Record<string, unknown>> {
  customDurationEnabled: boolean;
  setCustomDurationEnabled: (value: boolean) => void;
  customMarginEnabled: boolean;
  setCustomMarginEnabled: (value: boolean) => void;
  match: MatchInterface;
  form: UseFormReturnType<
    ExtendedObj & {
      custom_duration_minutes: number | null;
      custom_margin_minutes: number | null;
    },
    (
      values: ExtendedObj & {
        custom_duration_minutes: number | null;
        custom_margin_minutes: number | null;
      }
    ) => ExtendedObj & {
      custom_duration_minutes: number | null;
      custom_margin_minutes: number | null;
    }
  >;
}

export default function CommonCustomTimeMatchesForm<
  ExtendedValues extends Record<string, unknown> = Record<string, unknown>,
>({
  form,
  customDurationEnabled,
  customMarginEnabled,
  match,
  setCustomDurationEnabled,
  setCustomMarginEnabled,
}: CommonCustomTimeMatchesFormProps<ExtendedValues>) {
  const { t } = useTranslation();

  const matchDuration = useMemo(() => {
    const value = customDurationEnabled
      ? form.values.custom_duration_minutes
      : match.duration_minutes;
    return value ?? 0;
  }, [customDurationEnabled, match.custom_duration_minutes, match.duration_minutes]);

  const matchMargin = useMemo(() => {
    const value = customMarginEnabled ? form.values.custom_margin_minutes : match.margin_minutes;
    return value ?? 0;
  }, [customMarginEnabled, match.custom_margin_minutes, match.margin_minutes]);

  const endDatetime = useMemo(() => fromUnixTime(
      getUnixTime(parseISO(match.start_time)) + matchDuration * 60 + matchMargin * 60
    ), [match.start_time, matchDuration, matchMargin]);

  return (
    <>
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
        <Input
          component="time"
          dateTime={endDatetime.toISOString()}
        >
          {format(endDatetime, 'd LLLL yyyy HH:mm')}
        </Input>
      </Input.Wrapper>
    </>
  );
}
