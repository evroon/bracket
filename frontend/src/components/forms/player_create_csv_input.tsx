import { Code, Text, Textarea } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import React from 'react';

export function MultiPlayersInput({ form }: { form: UseFormReturnType<any> }) {
  const { t } = useTranslation();
  return (
    <Textarea
      label={t('multiple_players_input_label')}
      placeholder={t('multiple_players_input_placeholder')}
      minRows={10}
      {...form.getInputProps('names')}
    />
  );
}

export function MultiTeamsInput({ form }: { form: UseFormReturnType<any> }) {
  const { t } = useTranslation();
  return (
    <>
      <Textarea
        label={t('multiple_teams_input_label')}
        placeholder={t('multiple_teams_input_placeholder')}
        minRows={10}
        {...form.getInputProps('names')}
      />
      <Text mt="1rem">{t('example_label')}</Text>
      <Code block>
        Team 1
        <br />
        Team 2,Alex
        <br />
        Team 3,Bob,Charlie
      </Code>
    </>
  );
}
