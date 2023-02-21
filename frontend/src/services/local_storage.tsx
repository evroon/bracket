export function performLogout() {
  localStorage.removeItem('login');
}

export function getLogin() {
  const login = localStorage.getItem('login');
  return login != null ? JSON.parse(login) : {};
}
