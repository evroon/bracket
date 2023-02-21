import { UserBodyInterface, UserToRegisterInterface } from '../interfaces/user';
import { createAxios, handleRequestError } from './adapter';

export async function performLogin(username: string, password: string) {
  const bodyFormData = new FormData();
  bodyFormData.append('grant_type', 'password');
  bodyFormData.append('username', username);
  bodyFormData.append('password', password);

  const { data } = await createAxios()
    .post('token', bodyFormData)
    .catch((err_response: any) => handleRequestError(err_response));

  if (data == null) {
    return false;
  }

  localStorage.setItem('login', JSON.stringify(data));

  handleRequestError(data);

  // Reload axios object.
  createAxios();
  return true;
}

export async function updateUser(user_id: number, user: UserBodyInterface) {
  return createAxios()
    .patch(`users/${user_id}`, user)
    .catch((response: any) => handleRequestError(response));
}

export async function updatePassword(user_id: number, password: string) {
  return createAxios()
    .patch(`users/${user_id}/password`, { password })
    .catch((response: any) => handleRequestError(response));
}

export async function registerUser(user: UserToRegisterInterface) {
  return createAxios()
    .post('users/register', user)
    .catch((response: any) => handleRequestError(response));
}
