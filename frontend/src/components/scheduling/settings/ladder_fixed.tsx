import { Divider, Flex, Group, NumberInput, Radio } from '@mantine/core';
import { IconListNumbers, IconMedal, IconRepeat } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { SchedulerSettings } from '../../../interfaces/match';

export default function LadderFixed({
  schedulerSettings,
}: {
  schedulerSettings: SchedulerSettings;
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
    </Flex>
  );
}
