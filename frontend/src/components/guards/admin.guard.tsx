import { getUser } from '@services/adapter';
import { Navigate, Outlet } from 'react-router';

export const AdminGuard = () => {
  const { data: user } = getUser();

  if (!user || !user.data) {
    return <Navigate to="/login" replace />;
  }

  if (user.data.account_type !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
