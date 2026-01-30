import { Button, Modal, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import { OfficialsResponse } from '@services/adapter';
import { createOfficial } from '@services/official';

export default function OfficialModal({
  tournamentId,
  swrOfficialsResponse,
}: {
  tournamentId: number;
  swrOfficialsResponse: SWRResponse<OfficialsResponse>;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const form = useForm({
    initialValues: {
      name: '',
    },

    validate: {
      name: (value) => (value.length > 0 ? null : t('too_short_name_validation')),
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setCreatedCode(null);
        }}
        title={t('add_official_title')}
      >
        {createdCode != null ? (
          <>
            <Text fw={500}>{t('official_created_label')}</Text>
            <Text mt="sm">
              {t('access_code_label')}: <strong>{createdCode}</strong>
            </Text>
            <Button
              fullWidth
              style={{ marginTop: 10 }}
              onClick={() => {
                setCreatedCode(null);
                form.reset();
              }}
            >
              {t('add_another_button')}
            </Button>
          </>
        ) : (
          <form
            onSubmit={form.onSubmit(async (values) => {
              const response = await createOfficial(tournamentId, values.name);
              await swrOfficialsResponse.mutate();
              if (response && 'data' in response && response.data?.data?.access_code) {
                setCreatedCode(response.data.data.access_code);
              } else {
                setOpened(false);
              }
            })}
          >
            <TextInput
              withAsterisk
              label={t('name_input_label')}
              placeholder={t('official_name_placeholder')}
              {...form.getInputProps('name')}
            />

            <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
              {t('save_button')}
            </Button>
          </form>
        )}
      </Modal>
      <Button
        variant="outline"
        color="green"
        size="sm"
        style={{ marginRight: 10 }}
        onClick={() => setOpened(true)}
        leftSection={<GoPlus size={24} />}
      >
        {t('add_official_title')}
      </Button>
    </>
  );
}
