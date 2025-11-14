import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { NavigateFunction } from 'react-router';

import { Translator } from '../components/utils/types';

export function performLogout() {
  localStorage.removeItem('login');
}

export function performLogoutAndRedirect(t: Translator, navigate: NavigateFunction) {
  performLogout();

  showNotification({
    color: 'green',
    title: t('logout_success_title'),
    icon: <IconCheck />,
    message: '',
    autoClose: 10000,
  });
  navigate('/login', { replace: true });
}

export function getLogin() {
  const login = localStorage.getItem('login');
  return login != null ? JSON.parse(login) : {};
}

export function tokenPresent() {
  return localStorage.getItem('login') != null;
}
