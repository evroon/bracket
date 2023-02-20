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

export function performLogout() {
  localStorage.removeItem('login');
}
