import { Alert, Button, Checkbox, Container, Paper, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ClientOnly } from '../components/utils/react';
import { HCaptchaInput } from '../components/utils/util';
import { tokenPresent } from '../services/local_storage';
import { registerDemoUser } from '../services/user';
import classes from './create_account.module.css';

export default function CreateDemoAccountPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  useEffect(() => {
    if (tokenPresent()) {
      navigate('/');
    }
  }, []);

  async function registerAndRedirect() {
    const response = await registerDemoUser(captchaToken);

    if (response != null && response.data != null && response.data.data != null) {
      localStorage.setItem('login', JSON.stringify(response.data.data));
      await navigate('/');
    }
  }

  const form = useForm({
    initialValues: {
      policy_accepted: false,
    },

    validate: {
      policy_accepted: (value) => (value ? null : t('policy_not_accepted')),
    },
  });

  return (
    <Container size={640} my={30}>
      <Title className={classes.title} ta="center">
        {t('create_demo_account_title')}
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          mb={16}
          title={t('demo_policy_title')}
          color="blue"
          radius="md"
        >
          {t('demo_description')}
        </Alert>
        <form onSubmit={form.onSubmit(registerAndRedirect)}>
          <ClientOnly>
            <HCaptchaInput
              siteKey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
              setCaptchaToken={setCaptchaToken}
            />
          </ClientOnly>
          <Checkbox
            mt="lg"
            label={t('accept_policy_checkbox')}
            {...form.getInputProps('policy_accepted', { type: 'checkbox' })}
          />
          <Button color="green" className={classes.control} type="submit" mt="1rem" fullWidth>
            {t('start_demo_button')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
