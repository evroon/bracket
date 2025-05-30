import { Button, Card, Flex, Grid, Image, Text, Title, UnstyledButton } from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { getAvailableStageItemInputs } from '../../services/adapter';
import { createStage } from '../../services/stage';
import { CreateStageItemModal } from '../modals/create_stage_item';
import { CreateStagesFromTemplateModal } from '../modals/create_stages_from_template';
import { Translator } from '../utils/types';
import classes from './create_stage.module.css';

export default function CreateStageButton({
  tournament,
  swrStagesResponse,
  swrAvailableInputsResponse,
  swrRankingsPerStageItemResponse,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
  swrRankingsPerStageItemResponse: SWRResponse;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      color="green"
      size="xs"
      style={{ marginRight: 10 }}
      onClick={async () => {
        await createStage(tournament.id);
        await swrStagesResponse.mutate();
        await swrAvailableInputsResponse.mutate();
        await swrRankingsPerStageItemResponse.mutate();
      }}
      leftSection={<GoPlus size={24} />}
    >
      {t('add_stage_button')}
    </Button>
  );
}

export function CreateStageButtonLarge({
  tournament,
  swrStagesResponse,
}: {
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
}) {
  const { t } = useTranslation();
  const swrAvailableInputsResponse = getAvailableStageItemInputs(tournament.id);

  return (
    <>
      <Title mt="2rem" className={classes.title}>
        {t('no_matches_title')}
      </Title>
      <Text size="lg" ta="center" className={classes.description} inherit>
        {t('no_matches_description')}
      </Text>
      <CreateStagesFromTemplateButtons
        t={t}
        tournament={tournament}
        swrStagesResponse={swrStagesResponse}
        swrAvailableInputsResponse={swrAvailableInputsResponse}
      />
    </>
  );
}

function SingleStageItemSelectCard({
  title,
  descriptions,
  images,
  tournament,
  swrStagesResponse,
  swrAvailableInputsResponse,
  t,
  stage_item_type,
}: {
  title: string;
  descriptions: string[];
  images: string[];
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
  t: Translator;
  stage_item_type: 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION';
}) {
  const [opened, setOpened] = useState(false);
  const image_components = images.map((image) => <Image src={image} fit="scale-down"></Image>);
  const description_components = descriptions.map((description) => (
    <>
      {description}
      <br />
    </>
  ));
  return (
    <>
      <UnstyledButton
        onClick={() => {
          setOpened(true);
        }}
        w="100%"
      >
        <Card
          shadow="sm"
          padding="lg"
          radius="lg"
          h="22rem"
          withBorder
          className={classes.socialLink}
        >
          <Card.Section style={{ backgroundColor: '#dde' }}>
            <Flex justify="center" h={200} style={{ padding: '1.75rem' }}>
              {image_components}
            </Flex>
          </Card.Section>

          <Text fw={800} size="xl" mt="md" lineClamp={1}>
            {title}
          </Text>

          <Text mt="xs" c="dimmed" size="md" lineClamp={3}>
            {description_components}
          </Text>
        </Card>
      </UnstyledButton>
      <CreateStageItemModal
        t={t}
        tournament={tournament}
        stage={null}
        swrStagesResponse={swrStagesResponse}
        swrAvailableInputsResponse={swrAvailableInputsResponse}
        opened={opened}
        setOpened={setOpened}
        initial_type={stage_item_type}
      />
    </>
  );
}
function DualStageItemSelectCard({
  title,
  descriptions,
  images,
  tournament,
  swrStagesResponse,
  swrAvailableInputsResponse,
  t,
  first_stage_type,
}: {
  title: string;
  descriptions: string[];
  images: string[];
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
  t: Translator;
  first_stage_type: 'ROUND_ROBIN' | 'SWISS' | 'SINGLE_ELIMINATION';
}) {
  const [opened, setOpened] = useState(false);
  const image_components = images.map((image) => <Image src={image} fit="scale-down"></Image>);
  const description_components = descriptions.map((description) => (
    <>
      {description}
      <br />
    </>
  ));
  return (
    <>
      <UnstyledButton
        onClick={() => {
          setOpened(true);
        }}
        w="100%"
      >
        <Card
          shadow="sm"
          padding="lg"
          radius="lg"
          h="22rem"
          withBorder
          className={classes.socialLink}
        >
          <Card.Section style={{ backgroundColor: '#dde' }}>
            <Flex justify="center" h={200} style={{ padding: '1.75rem' }}>
              {image_components}
            </Flex>
          </Card.Section>

          <Text fw={800} size="xl" mt="md" lineClamp={1}>
            {title}
          </Text>

          <Text mt="xs" c="dimmed" size="md" lineClamp={3}>
            {description_components}
          </Text>
        </Card>
      </UnstyledButton>
      <CreateStagesFromTemplateModal
        t={t}
        tournament={tournament}
        swrStagesResponse={swrStagesResponse}
        swrAvailableInputsResponse={swrAvailableInputsResponse}
        opened={opened}
        setOpened={setOpened}
        first_stage_type={first_stage_type}
      />
    </>
  );
}

export function CreateStagesFromTemplateButtons({
  t,
  tournament,
  swrStagesResponse,
  swrAvailableInputsResponse,
}: {
  t: Translator;
  tournament: Tournament;
  swrStagesResponse: SWRResponse;
  swrAvailableInputsResponse: SWRResponse;
}) {
  return (
    <>
      <Title>1 Stage</Title>
      <Grid maw="80rem">
        <Grid.Col span={{ base: 12, xl: 4, md: 6 }}>
          <SingleStageItemSelectCard
            title={t('round_robin_label')}
            descriptions={[t('round_robin_description')]}
            images={['/icons/group-stage-item.svg']}
            tournament={tournament}
            swrStagesResponse={swrStagesResponse}
            swrAvailableInputsResponse={swrAvailableInputsResponse}
            t={t}
            stage_item_type="ROUND_ROBIN"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 4, md: 6 }}>
          <SingleStageItemSelectCard
            title={t('single_elimination_label')}
            descriptions={[t('single_elimination_description')]}
            images={['/icons/single-elimination-stage-item.svg']}
            tournament={tournament}
            swrStagesResponse={swrStagesResponse}
            swrAvailableInputsResponse={swrAvailableInputsResponse}
            t={t}
            stage_item_type="SINGLE_ELIMINATION"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 4, md: 6 }}>
          <SingleStageItemSelectCard
            title={t('swiss_label')}
            descriptions={[t('swiss_description')]}
            images={['/icons/swiss-stage-item.svg']}
            tournament={tournament}
            swrStagesResponse={swrStagesResponse}
            swrAvailableInputsResponse={swrAvailableInputsResponse}
            t={t}
            stage_item_type="SWISS"
          />
        </Grid.Col>
      </Grid>
      <Title>2 Stages</Title>
      <Grid maw="80rem">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <DualStageItemSelectCard
            title={`${t('round_robin_label')} + ${t('single_elimination_label')}`}
            descriptions={[
              `${t('round_robin_label')}: ${t('round_robin_description')}`,
              `${t('single_elimination_label')}: ${t('single_elimination_description')}`,
            ]}
            images={['/icons/group-stage-item.svg', '/icons/single-elimination-stage-item.svg']}
            tournament={tournament}
            swrStagesResponse={swrStagesResponse}
            swrAvailableInputsResponse={swrAvailableInputsResponse}
            t={t}
            first_stage_type="ROUND_ROBIN"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <DualStageItemSelectCard
            title={`${t('swiss_label')} + ${t('single_elimination_label')}`}
            descriptions={[
              `${t('swiss_label')}: ${t('swiss_description')}`,
              `${t('single_elimination_label')}: ${t('single_elimination_description')}`,
            ]}
            images={['/icons/swiss-stage-item.svg', '/icons/single-elimination-stage-item.svg']}
            tournament={tournament}
            swrStagesResponse={swrStagesResponse}
            swrAvailableInputsResponse={swrAvailableInputsResponse}
            t={t}
            first_stage_type="SWISS"
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
