import { Button, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconHash, IconUser } from '@tabler/icons-react';
import React from 'react';

import { UserInterface } from '../../interfaces/user';
import { updatePassword, updateUser } from '../../services/user';
import { PasswordStrength } from '../utils/password';

export default function UserForm({ user }: { user: UserInterface }) {
  const details_form = useForm({
    initialValues: {
      name: user != null ? user.name : '',
      email: user != null ? user.email : '',
      password: '',
    },

    validate: {
      name: (value) => (value !== '' ? null : 'Name cannot be empty'),
      email: (value) => (value !== '' ? null : 'Email cannot be empty'),
    },
  });
  const password_form = useForm({
    initialValues: {
      password: '',
    },

    validate: {
      password: (value) => (value.length >= 8 ? null : 'Password too short'),
    },
  });

  return (
    <Tabs defaultValue="details">
      <Tabs.List>
        <Tabs.Tab value="details" icon={<IconUser size="1.0rem" />}>
          Edit details
        </Tabs.Tab>
        <Tabs.Tab value="password" icon={<IconHash size="1.0rem" />}>
          Edit password
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
            label="Name"
            {...details_form.getInputProps('name')}
          />
          <TextInput
            withAsterisk
            mt="1.0rem"
            label="Email"
            type="email"
            {...details_form.getInputProps('email')}
          />
          <Button fullWidth style={{ marginTop: 20 }} color="green" type="submit">
            Save
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
            Save
          </Button>
        </form>
      </Tabs.Panel>
    </Tabs>
  );
}
