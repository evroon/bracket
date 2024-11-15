import { Button, Select, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BiGlobe } from '@react-icons/all-files/bi/BiGlobe';
import { IconHash, IconLogout, IconUser } from '@tabler/icons-react';
import assert from 'assert';
import { useRouter } from 'next/router';
import React from 'react';

import { UserInterface } from '../../interfaces/user';
import { performLogoutAndRedirect } from '../../services/local_storage';
import { updatePassword, updateUser } from '../../services/user';
import { PasswordStrength } from '../utils/password';

export default function UserForm({ user, t, i18n }: { user: UserInterface; t: any; i18n: any }) {
  const router = useRouter();
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

  const locales = [
    { value: 'zh', label: '🇨🇳 Chinese' },
    { value: 'nl', label: '🇳🇱 Dutch' },
    { value: 'en', label: '🇺🇸 English' },
    { value: 'fr', label: '🇫🇷 French' },
    { value: 'de', label: '🇩🇪 German' },
    { value: 'el', label: '🇬🇷 Greek' },
    { value: 'it', label: '🇮🇹 Italian' },
    { value: 'ja', label: '🇯🇵 Japanese' },
    { value: 'pt', label: '🇵🇹 Portuguese' },
    { value: 'es', label: '🇪🇸 Spanish' },
    { value: 'se', label: '🇸🇪 Swedish' },
  ];

  const changeLanguage = (newLocale: string | null) => {
    const { pathname, asPath, query } = router;
    assert(newLocale != null);
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <Tabs defaultValue="details">
      <Tabs.List>
        <Tabs.Tab value="details" leftSection={<IconUser size="1.0rem" />}>
          {t('edit_details_tab_title')}
        </Tabs.Tab>
        <Tabs.Tab value="password" leftSection={<IconHash size="1.0rem" />}>
          {t('edit_password_tab_title')}
        </Tabs.Tab>
        <Tabs.Tab value="language" leftSection={<BiGlobe size="1.0rem" />}>
          {t('edit_language_tab_title')}
        </Tabs.Tab>
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
      <Tabs.Panel value="language" pt="xs">
        <Select
          allowDeselect={false}
          value={i18n.language}
          label={t('language')}
          data={locales}
          onChange={async (lng) => changeLanguage(lng)}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
