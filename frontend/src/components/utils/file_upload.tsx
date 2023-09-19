import { Group, Text } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCloudUpload, IconDownload, IconX } from '@tabler/icons-react';
import { useRef } from 'react';

import { Tournament } from '../../interfaces/tournament';
import { uploadLogo } from '../../services/adapter';

export function DropzoneButton({ tournament }: { tournament: Tournament }) {
  // const { classes, theme } = useStyles();
  const openRef = useRef<() => void>(null);

  return (
    <div>
      <Dropzone
        mt="lg"
        openRef={openRef}
        onDrop={async (files) => uploadLogo(tournament.id, files[0])}
        // className={classes.dropzone}
        radius="md"
        accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
        maxSize={30 * 1024 ** 2}
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
            <Dropzone.Accept>Drop files here</Dropzone.Accept>
            <Dropzone.Reject>Pdf file less than 30mb</Dropzone.Reject>
            <Dropzone.Idle>Upload logo</Dropzone.Idle>
          </Text>
          <Text ta="center" size="sm" mt="xs" c="dimmed">
            Drop a file here to upload as tournament logo.
          </Text>
        </div>
      </Dropzone>
    </div>
  );
}
