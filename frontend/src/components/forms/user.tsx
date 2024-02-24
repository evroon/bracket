import { Button, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconHash, IconLogout, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';

import { UserInterface } from '../../interfaces/user';
import { performLogoutAndRedirect } from '../../services/local_storage';
import { updatePassword, updateUser } from '../../services/user';
import { PasswordStrength } from '../utils/password';

export default function UserForm({ user }: { user: UserInterface }) {
  const router = useRouter();
  const { t } = useTranslation();
  const details_form = useForm({
    initialValues: {
      name: user != null ? user.name : '',
      email: user != null ? user.email : '',
      password: '',
    },

    validate: {
      name: (value) => (value !== '' ? null : t('empty_name_validation')),
      email: (value) => (value !== '' ? null : t('empty_email_validation')),
    },
  });
  const password_form = useForm({
    initialValues: {
      password: '',
    },

    validate: {
      password: (value) => (value.length >= 8 ? null : t('too_short_password_validation')),
    },
  });

  return (
    <Tabs defaultValue="details">
      <Tabs.List>
        <Tabs.Tab value="details" leftSection={<IconUser size="1.0rem" />}>
          {t('edit_details_tab_title')}
        </Tabs.Tab>
        <Tabs.Tab value="password" leftSection={<IconHash size="1.0rem" />}>
          {t('edit_password_tab_title')}
        </Tabs.Tab>
        {/*<Tabs.Tab value="settings" icon={<IconSettings size="1.0rem" />}>*/}
        {/*  Settings*/}
        {/*</Tabs.Tab>*/}
      </Tabs.List>
      <Tabs.Panel value="details" pt="xs">
        <form
          onSubmit={details_form.onSubmit(async (values) => {
            if (user != null) await updateUser(user.id, values);
          })}
        >
          <TextInput
            withAsterisk
            mt="1.0rem"
            label={t('name_input_label')}
            {...details_form.getInputProps('name')}
          />
          <TextInput
            withAsterisk
            mt="1.0rem"
            label={t('email_input_label')}
            type="email"
            {...details_form.getInputProps('email')}
          />
          <Button fullWidth style={{ marginTop: 20 }} color="green" type="submit">
            {t('save_button')}
          </Button>
          <Button
            fullWidth
            style={{ marginTop: 20 }}
            color="red"
            variant="outline"
            leftSection={<IconLogout />}
            onClick={() => performLogoutAndRedirect(t, router)}
          >
            {t('logout_title')}
          </Button>
        </form>
      </Tabs.Panel>
      <Tabs.Panel value="password" pt="xs">
        <form
          onSubmit={password_form.onSubmit(async (values) => {
            if (user != null) await updatePassword(user.id, values.password);
          })}
        >
          <PasswordStrength form={password_form} />
          <Button fullWidth style={{ marginTop: 20 }} color="green" type="submit">
            {t('save_button')}
          </Button>
        </form>
      </Tabs.Panel>
    </Tabs>
  );
}
