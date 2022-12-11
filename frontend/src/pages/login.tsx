import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { showNotification } from '@mantine/notifications';
import Layout from './_layout';
import useStyles from '../components/login/login.styles';
import { performLogin } from '../services/user';

export default function Login() {
  const { classes } = useStyles();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function attemptLogin() {
    performLogin(username, password).then(() => {
      showNotification({
        color: 'green',
        title: 'Login successful',
        message: '',
      });
    });
  }

  return (
    <Layout>
      <Title className={classes.title} align="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span">
          Ladderz
        </Text>
      </Title>
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Group position="right" mt="lg">
            <Anchor<'a'> onClick={(event) => event.preventDefault()} href="#" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" onClick={() => attemptLogin()}>
            Sign in
          </Button>
        </Paper>
        <Text color="dimmed" size="sm" align="center" mt={15}>
          Do not have an account yet?{' '}
          <Anchor<'a'> href="#" size="sm" onClick={(event) => event.preventDefault()}>
            Create account
          </Anchor>
        </Text>
      </Container>
    </Layout>
  );
}
