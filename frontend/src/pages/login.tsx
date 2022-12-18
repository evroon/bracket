import { Button, Container, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

import useStyles from '../components/login/login.styles';
import { performLogin } from '../services/user';
import Layout from './_layout';

export default function Login() {
  const { classes } = useStyles();

  function attemptLogin(email: string, password: string) {
    performLogin(email, password).then(() => {
      showNotification({
        color: 'green',
        title: 'Login successful',
        message: '',
      });
    });
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
          Ladderz
        </Text>
      </Title>
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit((values) => attemptLogin(values.email, values.password))}>
            <TextInput
              label="Email"
              placeholder="Your email"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              {...form.getInputProps('password')}
            />
            {/*<Group position="right" mt="lg">*/}
            {/*  <Anchor<'a'> onClick={(event) => event.preventDefault()} href="#" size="sm">*/}
            {/*    Forgot password?*/}
            {/*  </Anchor>*/}
            {/*</Group>*/}
            <Button fullWidth mt="xl" type="submit">
              Sign in
            </Button>
          </form>
        </Paper>
        {/*<Text color="dimmed" size="sm" align="center" mt={15}>*/}
        {/*  Do not have an account yet?{' '}*/}
        {/*  <Anchor<'a'> href="#" size="sm" onClick={(event) => event.preventDefault()}>*/}
        {/*    Create account*/}
        {/*  </Anchor>*/}
        {/*</Text>*/}
      </Container>
    </Layout>
  );
}
