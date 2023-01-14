import { createAxios, handleRequestError } from './adapter';

export async function performLogin(username: string, password: string) {
  const bodyFormData = new FormData();
  bodyFormData.append('grant_type', 'password');
  bodyFormData.append('username', username);
  bodyFormData.append('password', password);

  const response = await createAxios()
    .post('token', bodyFormData)
    .catch((err_response: any) => handleRequestError(err_response));

  if (response == null) {
    return false;
  }

  localStorage.setItem('login', JSON.stringify(response.data));

  handleRequestError(response);

  // Reload axios object.
  createAxios();
  return true;
}

export function performLogout() {
  localStorage.removeItem('login');
}
