import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout title="Create account">
      <RegisterForm />
    </AuthLayout>
  );
}
