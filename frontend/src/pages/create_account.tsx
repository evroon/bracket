import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React from 'react';

import { PasswordStrength } from '../components/utils/password';
import { registerUser } from '../services/user';
import classes from './create_account.module.css';

export default function CreateAccount() {
  const router = useRouter();

  async function registerAndRedirect(values: any) {
    const response = await registerUser(values);

    if (response != null && response.data != null && response.data.data != null) {
      localStorage.setItem('login', JSON.stringify(response.data.data));
      await router.push('/');
    }
  }

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },

    validate: {
      name: (value) => (value !== '' ? null : 'Name cannot be empty'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value !== '' ? null : 'Password cannot be empty'),
    },
  });

  return (
    <Container size={460} my={30}>
      <Title className={classes.title} ta="center">
        Create a new account
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          mb={16}
          title="Unavailable"
          color="red"
          radius="lg"
        >
          Account creation is disabled on this domain for now since bracket is still in beta phase
        </Alert>
        <form
          onSubmit={form.onSubmit(async (values) => {
            await registerAndRedirect(values);
          })}
        >
          <TextInput
            label="Email Address"
            placeholder="Email Address"
            required
            type="email"
            {...form.getInputProps('email')}
          />
          <TextInput
            label="Name"
            placeholder="Name"
            required
            mt="lg"
            mb="lg"
            {...form.getInputProps('name')}
          />
          <PasswordStrength form={form} />
          <Group justify="apart" mt="lg" className={classes.controls}>
            <Anchor c="dimmed" size="sm" className={classes.control}>
              <Center inline>
                <IconArrowLeft size={12} stroke={1.5} />
                <Box ml={5} onClick={() => router.push('/login')}>
                  {' '}
                  Back to login page
                </Box>
              </Center>
            </Anchor>
            <Button className={classes.control} type="submit">
              Create account
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
