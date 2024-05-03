import {Button, Modal, TextInput} from '@mantine/core';
import {useTranslation} from 'next-i18next';
import {useState} from 'react';

export default function WelcomeModal() {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  return (
    <Modal opened={opened} onClose={() => setOpened(false)} title={t('welcome_title')}>
      <TextInput
        withAsterisk
        label={t('name_input_label')}
        placeholder={t('club_name_input_placeholder')}
      />

      <Button fullWidth style={{ marginTop: 10 }} color="green" type="submit">
        {t('save_button')}
      </Button>
    </Modal>
  );
}
