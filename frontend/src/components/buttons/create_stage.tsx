import {
    Button,
    Card,
    Center,
    Container, Divider,
    Flex,
    Grid,
    Group,
    Image,
    Stack,
    Text,
    Title,
    UnstyledButton
} from '@mantine/core';
import { GoPlus } from '@react-icons/all-files/go/GoPlus';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SWRResponse } from 'swr';

import { Tournament } from '../../interfaces/tournament';
import { createStage } from '../../services/stage';
import {Translator} from "../utils/types";
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

  return (
      <>
      <Title mt="2rem" className={classes.title}>{t('no_matches_title')}</Title>
      <Text size="lg" ta="center" className={classes.description} inherit>
        {t('no_matches_description')}
      </Text>
      <CreateStagesFromTemplateButtons  t={t}/>
          </>
  );
}

function StageSelectCard({
  title,
  descriptions,
  images,
  onClick,
}: {
  title: string;
  descriptions: string[];
  images: string[];
  onClick: () => void;
}) {
    const image_components = images.map((image) => (<Image src={image}   fit="scale-down"></Image>));
    const description_components = descriptions.map((description) => (<>{description}<br/></>));
  return (
    <UnstyledButton onClick={onClick} w="100%">
      <Card
        shadow="sm"
        padding="lg"
        radius="lg"
        h="22rem"
        withBorder
        className={classes.socialLink}
      >
        <Card.Section style={{ backgroundColor: '#dde' }}>
            <Flex direction="horizontal" justify="center" h={200} style={{ padding: '1.75rem' }}>
            {image_components}
                </Flex>
        </Card.Section>

        <Text fw={800} size="xl" mt="md" lineClamp={1} >
          {title}
        </Text>

        <Text mt="xs" c="dimmed" size="md" lineClamp={3}>
            {description_components}
        </Text>
      </Card>
    </UnstyledButton>
  );
}

export function CreateStagesFromTemplateButtons({
  t,
}: {
  t: Translator;
}) {
  return (
      <>
          <Title>1 Stage</Title>
    <Grid maw="80rem">
      <Grid.Col span={{ base: 12, xl: 4, md: 6 }}>
        <StageSelectCard
          title={t('round_robin_label')}
          descriptions={[t('round_robin_description')]}
          images={["/icons/group-stage-item.svg"]}
          onClick={() => {
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, xl: 4, md: 6 }}>
        <StageSelectCard
          title={t('single_elimination_label')}
          descriptions={[t('single_elimination_description')]}
          images={["/icons/single-elimination-stage-item.svg"]}
          onClick={() => {
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, xl: 4, md: 6 }}>
        <StageSelectCard
          title={t('swiss_label')}
          descriptions={[t('swiss_description')]}
          images={["/icons/swiss-stage-item.svg"]}
          onClick={() => {
          }}
        />
      </Grid.Col>
    </Grid>
          <Title>2 Stages</Title>
    <Grid maw="80rem">
      <Grid.Col span={{ base: 12,  lg: 6 }}>
        <StageSelectCard
          title={t('round_robin_label') + ' + ' + t('single_elimination_label')}
          descriptions={[t('round_robin_label') + ': ' + t('round_robin_description'), t('single_elimination_label') + ': ' + t('single_elimination_description')]}
          images={["/icons/group-stage-item.svg", "/icons/single-elimination-stage-item.svg"]}
          onClick={() => {
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <StageSelectCard
          title={t('round_robin_label') + ' + ' + t('swiss_label')}
          descriptions={[t('round_robin_label') + ': ' + t('round_robin_description'), t('single_elimination_label') + ': ' + t('single_elimination_description')]}
          images={["/icons/group-stage-item.svg", "/icons/swiss-stage-item.svg"]}
          onClick={() => {
          }}
        />
      </Grid.Col>
    </Grid></>
  );
}