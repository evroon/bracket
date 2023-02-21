import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  TextInput,
  Title,
  createStyles,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons';
import { useRouter } from 'next/router';
import React from 'react';

import { PasswordStrength } from '../components/utils/password';
import { registerUser } from '../services/user';

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 26,
    fontWeight: 900,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  controls: {
    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column-reverse',
    },
  },

  control: {
    [theme.fn.smallerThan('xs')]: {
      width: '100%',
      textAlign: 'center',
    },
  },
}));

export default function CreateAccount() {
  const { classes } = useStyles();
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
      <Title className={classes.title} align="center">
        Create a new account
      </Title>
      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
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
          <Group position="apart" mt="lg" className={classes.controls}>
            <Anchor color="dimmed" size="sm" className={classes.control}>
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
