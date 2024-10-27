import { Divider, Flex, Group, NumberInput, Progress, Radio, Stack } from '@mantine/core';
import { IconListNumbers, IconMedal, IconRepeat } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { SchedulerSettings } from '../../../interfaces/match';
import { RoundInterface } from '../../../interfaces/round';

export type SchedulingProgress = { courtsCount: number; scheduledMatchesCount: number };

export function getSwissRoundSchedulingProgress(
  draftRound: RoundInterface,
  swrCourtsResponse: SWRResponse
) {
  return {
    courtsCount: swrCourtsResponse.data?.data?.length || 0,
    scheduledMatchesCount: draftRound?.matches.length,
  };
}

export default function LadderFixed({
  schedulerSettings,
  progress,
}: {
  schedulerSettings: SchedulerSettings;
  progress: SchedulingProgress;
}) {
  const { t } = useTranslation();

  return (
    <Flex mih={50} gap="md" justify="flex-start" align="flex-start" direction="row" wrap="wrap">
      <NumberInput
        value={schedulerSettings.eloThreshold}
        onChange={(val) => schedulerSettings.setEloThreshold(val != null ? val : 0)}
        placeholder="100"
        label={t('elo_input_label')}
        min={0}
        step={10}
        leftSection={<IconMedal size={18} />}
      />
      <Divider orientation="vertical" />
      <Radio.Group
        value={schedulerSettings.onlyRecommended}
        onChange={schedulerSettings.setOnlyRecommended}
        label={t('only_recommended_input_group_label')}
      >
        <Group mt={8}>
          <Radio value="true" label={t('only_recommended_radio_label')} />
          <Radio value="false" label={t('all_matches_radio_label')} />
        </Group>
      </Radio.Group>
      <Divider orientation="vertical" />
      <NumberInput
        value={schedulerSettings.limit}
        onChange={(val) => schedulerSettings.setLimit(val != null ? val : 0)}
        placeholder="50"
        label={t('max_results_input_label')}
        min={0}
        step={10}
        leftSection={<IconListNumbers size={18} />}
      />
      <NumberInput
        value={schedulerSettings.iterations}
        onChange={(val) => schedulerSettings.setIterations(val != null ? val : 0)}
        placeholder="100"
        label={t('iterations_input_label')}
        min={0}
        step={100}
        leftSection={<IconRepeat size={18} />}
      />

      {progress.scheduledMatchesCount == null ? null : (
        <>
          <Divider orientation="vertical" />
          <Stack gap="6px" mt="1rem">
            {progress.scheduledMatchesCount} / {progress.courtsCount} {t('courts_filled_badge')}
            <Progress
              value={(progress.scheduledMatchesCount * 100) / progress.courtsCount}
              miw="12rem"
              striped
              color="indigo"
            />
          </Stack>
        </>
      )}
    </Flex>
  );
}
