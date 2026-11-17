import {
  Button,
  Card,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';

import {
  StageItemInputOptionsResponse,
  StageRankingResponse,
  StagesWithStageItemsResponse,
  Tournament,
} from '@openapi';
import { createAxios } from '@services/adapter';
import { getTeamsLookup } from '@services/lookups';
import { createStage } from '@services/stage';
import { createStageItem } from '@services/stage_item';

type StageType = 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION';

const ELIMINATION_SIZES = [2, 4, 8, 16, 32];
const MAX_TEAMS = 64;

const STAGE_TYPE_LABEL_KEYS: Record<StageType, string> = {
  ROUND_ROBIN: 'round_robin_label',
  SWISS: 'swiss_label',
  SINGLE_ELIMINATION: 'single_elimination_label',
};

interface Template {
  id: string;
  titleKey: string;
  descriptionKey: string;
  stages: StageType[];
}

const TEMPLATES: Template[] = [
  {
    id: 'round_robin_only',
    titleKey: 'template_round_robin_only_title',
    descriptionKey: 'template_round_robin_only_description',
    stages: ['ROUND_ROBIN'],
  },
  {
    id: 'single_elimination_only',
    titleKey: 'template_single_elimination_only_title',
    descriptionKey: 'template_single_elimination_only_description',
    stages: ['SINGLE_ELIMINATION'],
  },
  {
    id: 'round_robin_then_elimination',
    titleKey: 'template_round_robin_then_elimination_title',
    descriptionKey: 'template_round_robin_then_elimination_description',
    stages: ['ROUND_ROBIN', 'SINGLE_ELIMINATION'],
  },
  {
    id: 'swiss_then_elimination',
    titleKey: 'template_swiss_then_elimination_title',
    descriptionKey: 'template_swiss_then_elimination_description',
    stages: ['SWISS', 'SINGLE_ELIMINATION'],
  },
  {
    id: 'round_robin_swiss_elimination',
    titleKey: 'template_round_robin_swiss_elimination_title',
    descriptionKey: 'template_round_robin_swiss_elimination_description',
    stages: ['ROUND_ROBIN', 'SWISS', 'SINGLE_ELIMINATION'],
  },
];

function largestEliminationSizeAtMost(count: number): number {
  const sizes = ELIMINATION_SIZES.filter((size) => size <= count);
  return sizes.length > 0 ? Math.max(...sizes) : 2;
}

function defaultCountForStage(type: StageType, rawCount: number): number {
  if (type === 'SINGLE_ELIMINATION') {
    return largestEliminationSizeAtMost(rawCount);
  }
  return Math.min(Math.max(rawCount, 2), MAX_TEAMS);
}

// The first stage gets all teams, every later stage defaults to half of the previous stage.
function getDefaultCounts(stages: StageType[], teamCount: number): number[] {
  const counts: number[] = [];
  stages.forEach((type, index) => {
    const rawCount = index === 0 ? teamCount : Math.floor(counts[index - 1] / 2);
    counts.push(defaultCountForStage(type, rawCount));
  });
  return counts;
}

async function createStageAndGetId(tournamentId: number): Promise<number | null> {
  const created = await createStage(tournamentId);
  if (created == null) {
    return null;
  }

  const response = await createAxios().get(
    `tournaments/${tournamentId}/stages?no_draft_rounds=false`,
  );
  const stageIds: number[] = response.data.data.map((stage: any) => stage.id);
  return Math.max(...stageIds);
}

async function applyTemplate(
  stages: StageType[],
  counts: number[],
  tournamentId: number,
): Promise<boolean> {
  for (let i = 0; i < stages.length; i += 1) {
    // Stages are created one after another, since each stage item needs its stage's id.
    const stageId = await createStageAndGetId(tournamentId);
    if (stageId == null) {
      return false;
    }
    const stageItem = await createStageItem(tournamentId, stageId, stages[i], counts[i]);
    if (stageItem == null) {
      return false;
    }
  }
  return true;
}

function TemplateCard({
  title,
  description,
  flow,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  flow: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <UnstyledButton onClick={onClick} w="100%">
      <Card
        shadow="sm"
        padding="lg"
        radius="lg"
        withBorder
        style={{ border: selected ? '3px solid var(--mantine-color-green-7)' : '' }}
      >
        <Text fw={800} size="lg">
          {title}
        </Text>
        <Text mt={4} size="sm" c="green" fw={600}>
          {flow}
        </Text>
        <Text mt="xs" c="dimmed" size="sm">
          {description}
        </Text>
      </Card>
    </UnstyledButton>
  );
}

export default function TournamentTemplateModal({
  tournament,
  swrStagesResponse,
  swrAvailableInputsResponse,
  swrRankingsPerStageItemResponse,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse<StagesWithStageItemsResponse>;
  swrAvailableInputsResponse: SWRResponse<StageItemInputOptionsResponse>;
  swrRankingsPerStageItemResponse: SWRResponse<StageRankingResponse>;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [submitting, setSubmitting] = useState(false);

  const teamsMap = getTeamsLookup(tournament.id);
  const teamCount = teamsMap != null ? Object.keys(teamsMap).length : 0;

  const selectedTemplate =
    TEMPLATES.find((template) => template.id === selectedTemplateId) ?? TEMPLATES[0];

  const [counts, setCounts] = useState<number[]>(() =>
    getDefaultCounts(selectedTemplate.stages, teamCount),
  );

  useEffect(() => {
    setCounts(getDefaultCounts(selectedTemplate.stages, teamCount));
  }, [selectedTemplate, teamCount, opened]);

  const updateCount = (index: number, value: number) => {
    setCounts((previous) => previous.map((count, i) => (i === index ? value : count)));
  };

  const errors = counts.map((count, index) => {
    if (!Number.isFinite(count) || count < 2) {
      return t('at_least_two_team_validation');
    }
    if (index > 0 && count > counts[index - 1]) {
      return t('template_advancing_too_many_error', { max: counts[index - 1] });
    }
    return null;
  });
  const hasErrors = errors.some((error) => error != null);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('tournament_templates_modal_title')}
        size="45rem"
      >
        <Stack>
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              title={t(template.titleKey)}
              description={t(template.descriptionKey)}
              flow={template.stages.map((type) => t(STAGE_TYPE_LABEL_KEYS[type])).join(' → ')}
              selected={selectedTemplateId === template.id}
              onClick={() => setSelectedTemplateId(template.id)}
            />
          ))}
        </Stack>

        <Text mt="lg" size="sm" c="dimmed">
          {t('template_current_team_count', { count: teamCount })}
        </Text>

        <Stack mt="xs">
          {selectedTemplate.stages.map((type, index) => {
            const stageLabel = t(STAGE_TYPE_LABEL_KEYS[type]);
            const label =
              index === 0
                ? t('template_first_stage_teams_label', { stage: stageLabel })
                : t('template_advancing_teams_label', { stage: stageLabel });
            const key = `${selectedTemplate.id}-${index}`;

            if (type === 'SINGLE_ELIMINATION') {
              return (
                <Select
                  key={key}
                  withAsterisk
                  label={label}
                  data={ELIMINATION_SIZES.map((size) => ({
                    value: String(size),
                    label: String(size),
                  }))}
                  value={String(counts[index])}
                  onChange={(value) => updateCount(index, Number(value))}
                  allowDeselect={false}
                  error={errors[index]}
                />
              );
            }

            return (
              <NumberInput
                key={key}
                withAsterisk
                label={label}
                value={counts[index]}
                min={2}
                max={MAX_TEAMS}
                allowDecimal={false}
                onChange={(value) => updateCount(index, Number(value))}
                error={errors[index]}
              />
            );
          })}
        </Stack>

        <Button
          fullWidth
          mt="1.5rem"
          color="green"
          loading={submitting}
          disabled={hasErrors}
          onClick={async () => {
            setSubmitting(true);
            try {
              const created = await applyTemplate(selectedTemplate.stages, counts, tournament.id);
              await swrStagesResponse.mutate();
              await swrAvailableInputsResponse.mutate();
              await swrRankingsPerStageItemResponse.mutate();
              if (created) {
                setOpened(false);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {t('apply_template_button')}
        </Button>
      </Modal>

      <Button
        variant="outline"
        color="green"
        size="lg"
        onClick={() => setOpened(true)}
        leftSection={<GoPlus size={24} />}
      >
        {t('tournament_templates_button')}
      </Button>
    </>
  );
}