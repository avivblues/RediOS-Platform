import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Registration UI Foundation"
      subtitle="Create an organization-ready RediOS account request. USER metadata integration will connect in the next phase."
      title="Create RediOS Account"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
