import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { NextRouter } from 'next/router';
import React from 'react';

export function performLogout() {
  localStorage.removeItem('login');
}

export function performLogoutAndRedirect(router: NextRouter) {
  performLogout();

  showNotification({
    color: 'green',
    title: 'Logout successful',
    icon: <IconCheck />,
    message: '',
    autoClose: 10000,
  });
  router.push('/login');
}

export function getLogin() {
  const login = localStorage.getItem('login');
  return login != null ? JSON.parse(login) : {};
}

export function tokenPresent() {
  return localStorage.getItem('login') != null;
}
