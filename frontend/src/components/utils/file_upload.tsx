import { Group, Text } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCloudUpload, IconDownload, IconX } from '@tabler/icons-react';
import { AxiosError } from 'axios';
import { useTranslation } from 'next-i18next';
import { useMemo, useRef } from 'react';
import { SWRResponse } from 'swr';

import { TeamInterface } from '../../interfaces/team';
import { Tournament } from '../../interfaces/tournament';
import { handleRequestError, uploadTeamLogo, uploadTournamentLogo } from '../../services/adapter';

export function DropzoneButton({
  tournamentId,
  swrResponse,
  variant,
  teamId,
}: {
  tournamentId: Tournament['id'];
  swrResponse: SWRResponse;
  variant: 'tournament' | 'team';
  teamId?: TeamInterface['id'];
}) {
  // const { classes, theme } = useStyles();
  const openRef = useRef<() => void>(null);
  const { t } = useTranslation();

  const useUploadLogo = useMemo(() => {
    if (variant === 'tournament') {
      return uploadTournamentLogo.bind(null, tournamentId);
    }

    if (teamId === undefined) throw new TypeError('Team is undefined');
    return uploadTeamLogo.bind(null, tournamentId, teamId);
  }, [tournamentId, teamId, variant]);

  return (
    <div>
      <Dropzone
        mt="lg"
        openRef={openRef}
        onDrop={async (files) => {
          const response = await useUploadLogo(files[0]);
          await swrResponse.mutate();
          handleRequestError(response as unknown as AxiosError); // TODO: Check with Erik if this is correct
        }}
        // className={classes.dropzone}
        radius="md"
        accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
        maxSize={5 * 1024 ** 2}
      >
        <div style={{ pointerEvents: 'none' }}>
          <Group justify="center">
            <Dropzone.Accept>
              <IconDownload size={50} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={50} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconCloudUpload size={50} stroke={1.5} />
            </Dropzone.Idle>
          </Group>

          <Text ta="center" fw={700} size="lg" mt="xl">
            <Dropzone.Accept>{t('dropzone_accept_text')}</Dropzone.Accept>
            <Dropzone.Reject>{t('dropzone_reject_text')}</Dropzone.Reject>
            <Dropzone.Idle>{t('dropzone_idle_text')}</Dropzone.Idle>
          </Text>
          <Text ta="center" size="sm" mt="xs" c="dimmed">
            {t(`upload_placeholder_${variant}`)}
            <br />
            {t('dropzone_reject_text')}
          </Text>
        </div>
      </Dropzone>
    </div>
  );
}
