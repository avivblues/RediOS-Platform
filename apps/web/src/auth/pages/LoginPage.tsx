import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Identity Access"
      subtitle="Sign in to run generated applications, manage metadata, and continue building experiences."
      title="Runtime access for metadata-driven applications."
    >
      <LoginForm />
    </AuthLayout>
  );
}
