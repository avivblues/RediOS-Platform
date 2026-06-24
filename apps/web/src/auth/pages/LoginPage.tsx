import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout title="Sign in" tagline="Industrial Intelligence Operating System">
      <LoginForm />
    </AuthLayout>
  );
}
