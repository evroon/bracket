import { createAxios } from './adapter';

export async function performLogin(username: string, password: string) {
  const bodyFormData = new FormData();
  bodyFormData.append('grant_type', 'password');
  bodyFormData.append('username', username);
  bodyFormData.append('password', password);

  const response = await createAxios().post('token', bodyFormData);
  localStorage.setItem('login', JSON.stringify(response.data));

  // Reload axios object.
  createAxios();
  return response;
}

export function performLogout() {
  localStorage.removeItem('login');
}
