import { Divider, Flex, Group, NumberInput, Radio } from '@mantine/core';
import { IconListNumbers, IconMedal, IconRepeat } from '@tabler/icons-react';
import { SWRResponse } from 'swr';

import { SchedulerSettings } from '../../interfaces/match';
import { Tournament } from '../../interfaces/tournament';
import UpcomingMatchesTable from '../tables/upcoming_matches';

export default function Scheduler({
  tournamentData,
  round_id,
  swrRoundsResponse,
  swrUpcomingMatchesResponse,
  schedulerSettings,
}: {
  round_id: number;
  tournamentData: Tournament;
  swrRoundsResponse: SWRResponse;
  swrUpcomingMatchesResponse: SWRResponse;
  schedulerSettings: SchedulerSettings;
}) {
  return (
    <>
      {' '}
      <Flex mih={50} gap="md" justify="flex-start" align="flex-start" direction="row" wrap="wrap">
        <NumberInput
          value={schedulerSettings.eloThreshold}
          onChange={(val) => schedulerSettings.setEloThreshold(val != null ? val : 0)}
          placeholder="100"
          label="Max ELO difference"
          min={0}
          step={10}
          icon={<IconMedal size={18} />}
        />
        <Divider orientation="vertical" />
        <Radio.Group
          value={schedulerSettings.onlyBehindSchedule}
          onChange={schedulerSettings.setOnlyBehindSchedule}
          label="Only show teams/players who played less matches"
        >
          <Group mt={8}>
            <Radio value="true" label="Only players who played less" />
            <Radio value="false" label="All matches" />
          </Group>
        </Radio.Group>
        <Divider orientation="vertical" />
        <NumberInput
          value={schedulerSettings.limit}
          onChange={(val) => schedulerSettings.setLimit(val != null ? val : 0)}
          placeholder="50"
          label="Max results"
          min={0}
          step={10}
          icon={<IconListNumbers size={18} />}
        />
        <NumberInput
          value={schedulerSettings.iterations}
          onChange={(val) => schedulerSettings.setIterations(val != null ? val : 0)}
          placeholder="100"
          label="Iterations"
          min={0}
          step={100}
          icon={<IconRepeat size={18} />}
        />
      </Flex>
      <Divider mt={12} />
      <h4>Schedule new matches</h4>
      <UpcomingMatchesTable
        round_id={round_id}
        tournamentData={tournamentData}
        swrRoundsResponse={swrRoundsResponse}
        swrUpcomingMatchesResponse={swrUpcomingMatchesResponse}
      />
    </>
  );
}
