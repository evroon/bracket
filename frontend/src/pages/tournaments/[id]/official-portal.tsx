import { Alert, Button, Card, Container, Group, NumberInput, Text, TextInput, Title } from '@mantine/core';
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getBaseApiUrl } from '@services/adapter';

interface PortalMatch {
  id: number;
  position_in_schedule: number | null;
  start_time: string | null;
  court_name: string | null;
  stage_item_input1_score: number;
  stage_item_input2_score: number;
  team1_name: string | null;
  team2_name: string | null;
}

interface OfficialInfo {
  id: number;
  name: string;
  access_code: string;
  tournament_id: number;
}

function createPortalAxios() {
  return axios.create({
    baseURL: getBaseApiUrl(),
    headers: {
      Accept: 'application/json',
    },
  });
}

function MatchScoreCard({
  match,
  accessCode,
  onScoreSubmitted,
}: {
  match: PortalMatch;
  accessCode: string;
  onScoreSubmitted: () => void;
}) {
  const { t } = useTranslation();
  const [score1, setScore1] = useState<number>(match.stage_item_input1_score);
  const [score2, setScore2] = useState<number>(match.stage_item_input2_score);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
      <Group justify="space-between" mb="xs">
        <Text fw={500}>
          {match.position_in_schedule != null
            ? `${t('game_label')} #${match.position_in_schedule + 1}`
            : t('match_label')}
        </Text>
        {match.court_name && (
          <Text size="sm" c="dimmed">
            {match.court_name}
          </Text>
        )}
      </Group>

      {match.start_time && (
        <Text size="sm" c="dimmed" mb="sm">
          {new Date(match.start_time).toLocaleString()}
        </Text>
      )}

      <Group grow mb="md">
        <div>
          <Text size="sm" fw={500} mb={4}>
            {match.team1_name ?? t('tbd_label')}
          </Text>
          <NumberInput
            value={score1}
            onChange={(val) => setScore1(Number(val))}
            min={0}
          />
        </div>
        <div>
          <Text size="sm" fw={500} mb={4}>
            {match.team2_name ?? t('tbd_label')}
          </Text>
          <NumberInput
            value={score2}
            onChange={(val) => setScore2(Number(val))}
            min={0}
          />
        </div>
      </Group>

      <Button
        fullWidth
        color="green"
        loading={submitting}
        onClick={async () => {
          setSubmitting(true);
          try {
            await createPortalAxios().put(
              `official_portal/matches/${match.id}/score?access_code=${accessCode}`,
              {
                stage_item_input1_score: score1,
                stage_item_input2_score: score2,
              }
            );
            onScoreSubmitted();
          } catch {
            // Error handled by UI feedback
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {t('submit_score_button')}
      </Button>
    </Card>
  );
}

export default function OfficialPortalPage() {
  const { t } = useTranslation();
  const [accessCode, setAccessCode] = useState('');
  const [officialInfo, setOfficialInfo] = useState<OfficialInfo | null>(null);
  const [matches, setMatches] = useState<PortalMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const response = await createPortalAxios().post('official_portal/login', {
        access_code: accessCode,
      });
      setOfficialInfo(response.data.official);
      await fetchMatches();
    } catch {
      setError(t('invalid_access_code_error'));
    } finally {
      setLoading(false);
    }
  }

  async function fetchMatches() {
    try {
      const response = await createPortalAxios().get(
        `official_portal/matches?access_code=${accessCode}`
      );
      setMatches(response.data.data);
    } catch {
      // Silently handle
    }
  }

  if (officialInfo == null) {
    return (
      <Container size="xs" mt="xl">
        <Title order={2} mb="lg">
          {t('official_portal_title')}
        </Title>
        <Text mb="md">{t('official_portal_description')}</Text>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <TextInput
          label={t('access_code_label')}
          placeholder={t('enter_access_code_placeholder')}
          value={accessCode}
          onChange={(e) => setAccessCode(e.currentTarget.value)}
          mb="md"
        />
        <Button fullWidth color="blue" onClick={handleLogin} loading={loading}>
          {t('login_button')}
        </Button>
      </Container>
    );
  }

  return (
    <Container size="sm" mt="xl">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>{t('official_portal_title')}</Title>
          <Text c="dimmed">
            {t('logged_in_as_label')}: {officialInfo.name}
          </Text>
        </div>
        <Button
          variant="outline"
          color="gray"
          onClick={() => {
            setOfficialInfo(null);
            setMatches([]);
            setAccessCode('');
          }}
        >
          {t('logout_button')}
        </Button>
      </Group>

      {matches.length === 0 ? (
        <Alert color="blue">{t('no_assigned_matches_message')}</Alert>
      ) : (
        matches.map((match) => (
          <MatchScoreCard
            key={match.id}
            match={match}
            accessCode={accessCode}
            onScoreSubmitted={fetchMatches}
          />
        ))
      )}
    </Container>
  );
}
