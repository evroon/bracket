import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import useStyles from '../components/login/login.styles';
import { tokenPresent } from '../services/local_storage';
import { performLogin } from '../services/user';
import Layout from './_layout';

export default function Login() {
  const { classes } = useStyles();
  const router = useRouter();

  useEffect(() => {
    if (tokenPresent()) {
      router.replace('/');
    }
  }, []);

  async function attemptLogin(email: string, password: string) {
    const success = await performLogin(email, password);
    if (success) {
      showNotification({
        color: 'green',
        title: 'Login successful',
        message: '',
      });

      await router.push('/');
    }
  }

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) =>
        value.length >= 8 ? null : 'Password needs to contain at least 8 characters',
    },
  });

  return (
    <Layout>
      <Title className={classes.title} align="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span">
          Bracket
        </Text>
      </Title>
      <Container size={480} my={40}>
        <Paper withBorder shadow="md" p={30} pt={8} mt={30} radius="md">
          {/*<Button*/}
          {/*  size="md"*/}
          {/*  fullWidth*/}
          {/*  mt="lg"*/}
          {/*  type="submit"*/}
          {/*  color="gray"*/}
          {/*  leftIcon={<FaGithub size={20} />}*/}
          {/*>*/}
          {/*  Continue with GitHub*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  size="md"*/}
          {/*  fullWidth*/}
          {/*  mt="lg"*/}
          {/*  type="submit"*/}
          {/*  color="indigo"*/}
          {/*  leftIcon={<FaGoogle size={20} />}*/}
          {/*>*/}
          {/*  Continue with Google*/}
          {/*</Button>*/}
          {/*<Divider label="Or continue with email" labelPosition="center" my="lg" />*/}
          <form
            onSubmit={form.onSubmit(async (values) => attemptLogin(values.email, values.password))}
          >
            <TextInput
              label="Email"
              placeholder="Your email"
              required
              my="lg"
              type="email"
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              {...form.getInputProps('password')}
            />
            <Button fullWidth mt="xl" type="submit">
              Sign in
            </Button>
          </form>
          <Text color="dimmed" size="sm" align="center" mt={15}>
            <Anchor<'a'> onClick={() => router.push('/create_account')} size="sm">
              Create account
            </Anchor>
            {' - '}
            <Anchor<'a'> onClick={() => router.push('/password_reset')} size="sm">
              Forgot password?
            </Anchor>
          </Text>
        </Paper>
      </Container>
    </Layout>
  );
}
