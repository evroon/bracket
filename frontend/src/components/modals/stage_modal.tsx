import { Button, Divider, Modal, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiTrophy } from '@react-icons/all-files/bi/BiTrophy';
import { useState } from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { createStage } from '../../services/stage';
import StagesTable from '../tables/stages';

function CreateStageForm(tournament: Tournament, swrClubsResponse: SWRResponse) {
  const form = useForm({
    initialValues: { type: 'ROUND_ROBIN' },
    validate: {},
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        await createStage(tournament.id, values.type);
        await swrClubsResponse.mutate(null);
      })}
    >
      <Divider mt={12} />
      <h5>Add Stage</h5>
      <Select
        label="Stage Type"
        data={[
          { value: 'ROUND_ROBIN', label: 'Round Robin' },
          { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
          { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
        ]}
        {...form.getInputProps('type')}
      />
      <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
        Create Stage
      </Button>
    </form>
  );
}

export default function StagesModal({
  tournament,
  swrStagesResponse,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
}) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Add or remove stages">
        <StagesTable tournament={tournament} swrStagesResponse={swrStagesResponse} />
        {CreateStageForm(tournament, swrStagesResponse)}
      </Modal>

      <Button
        color="green"
        size="md"
        style={{ marginBottom: 10 }}
        onClick={() => setOpened(true)}
        leftIcon={<BiTrophy size={24} color="white" />}
      >
        Edit Stages
      </Button>
    </>
  );
}
