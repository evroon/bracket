import { createAxios } from './adapter';

export function performLogin(username: string, password: string) {
  const bodyFormData = new FormData();
  bodyFormData.append('grant_type', 'password');
  bodyFormData.append('username', username);
  bodyFormData.append('password', password);

  return createAxios()
    .post('token', bodyFormData)
    .then((r: any) => {
      localStorage.setItem('login', JSON.stringify(r.data));
      createAxios();
      return r;
    });
}
