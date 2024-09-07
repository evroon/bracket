import { Select } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { Ranking } from '../../interfaces/ranking';

export function RankingSelect({ form, rankings }: { form: any; rankings: Ranking[] }) {
  const { t } = useTranslation();

  const data = rankings.map((ranking: Ranking, i: number) => ({
    value: ranking.id.toString(),
    label: `${t('ranking_title')} ${ranking.position + 1} ${i === 0 ? `(${t('default_label')})` : ''}`,
  }));

  return (
    <Select
      withAsterisk
      data={data}
      label={t('ranking_title')}
      searchable
      allowDeselect={false}
      limit={16}
      mt={24}
      {...form.getInputProps('ranking_id')}
    />
  );
}
