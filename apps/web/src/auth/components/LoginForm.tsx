import { useState } from 'react';
import { useRuntimeContext } from '../../core/context/runtime-context';
import { REDIOS_ADMIN_APP_CODE } from '../../identity/identity-engine';
import { useAuth } from '../context/AuthProvider';

interface LoginErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const auth = useAuth();
  const { updateContext } = useRuntimeContext();
  const [email, setEmail] = useState('admin@redios.local');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});

  async function submitLogin() {
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const session = await auth.login({ email, password });
      updateContext({
        applicationCode: REDIOS_ADMIN_APP_CODE,
        permissions: session.permissions,
        roles: session.roles,
        userId: session.userId,
      });
      window.location.href = '/apps/redios-admin';
    } catch {
      // Error state is managed by AuthProvider.
    }
  }

  return (
    <form className="redios-auth-form" onSubmit={(event) => {
      event.preventDefault();
      void submitLogin();
    }}
    >
      <div className="redios-auth-form-heading">
        <span>Welcome Back</span>
        <h2>Login to RediOS</h2>
        <p>Use your platform account to access generated applications and Studio.</p>
      </div>

      {auth.error ? <div className="redios-auth-error">{auth.error}</div> : null}

      <label>
        <span>Email</span>
        <input autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@redios.local" />
        {errors.email ? <small>{errors.email}</small> : null}
      </label>

      <label>
        <span>Password</span>
        <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="admin123" />
        {errors.password ? <small>{errors.password}</small> : null}
      </label>

      <button className="redios-auth-primary" disabled={auth.loading} type="submit">
        {auth.loading ? 'Signing in...' : 'Login'}
      </button>

      <p className="redios-auth-switch">
        Need account? <a href="/register">Create Account</a>
      </p>
    </form>
  );
}

function validateLogin({ email, password }: { email: string; password: string }) {
  const errors: LoginErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Use a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}
