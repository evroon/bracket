import { Stack, Title } from '@mantine/core';

import UserForm from '../components/forms/user';
import { checkForAuthError, getTournaments, getUser } from '../services/adapter';
import { getLogin } from '../services/local_storage';
import Layout from './_layout';

export default function HomePage() {
  let user = null;

  const swrTournamentsResponse = getTournaments();
  checkForAuthError(swrTournamentsResponse);

  if (typeof window !== 'undefined') {
    const swrUserResponse = getUser(getLogin().user_id);
    user = swrUserResponse.data != null ? swrUserResponse.data.data : null;
  }

  const form = user != null ? <UserForm user={user} /> : null;

  return (
    <Layout>
      <Title>Edit profile</Title>
      <Stack style={{ width: '400px' }}>{form}</Stack>
    </Layout>
  );
}
