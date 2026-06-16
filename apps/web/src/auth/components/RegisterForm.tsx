import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthProvider';

interface RegisterErrors {
  confirmPassword?: string;
  displayName?: string;
  email?: string;
  organizationName?: string;
  password?: string;
}

type RegisterStatus = 'idle' | 'success';

export function RegisterForm() {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [status, setStatus] = useState<RegisterStatus>('idle');
  const strength = useMemo(() => passwordStrength(password), [password]);

  async function submitRegister() {
    const nextErrors = validateRegister({
      confirmPassword,
      displayName,
      email,
      organizationName,
      password,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await auth.registerAccount({
      displayName,
      email,
      password,
      organizationName,
    });
    setStatus('success');
  }

  if (status === 'success') {
    return (
      <section className="redios-auth-form redios-auth-success">
        <span>Registration</span>
        <h2>Account created successfully</h2>
        <p>Your account request has been accepted with status <strong>PENDING_ACTIVATION</strong>.</p>
        <button className="redios-auth-primary" type="button" onClick={() => { window.location.href = '/login'; }}>Go to Login</button>
      </section>
    );
  }

  return (
    <form className="redios-auth-form" onSubmit={(event) => {
      event.preventDefault();
      void submitRegister();
    }}
    >
      <div className="redios-auth-form-heading">
        <span>Registration</span>
        <h2>Create RediOS Account</h2>
        <p>Start your organization workspace. Activation and metadata identity will be connected in the next phase.</p>
      </div>

      {auth.error ? <div className="redios-auth-error">{auth.error}</div> : null}

      <label>
        <span>Full Name</span>
        <input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Jane Doe" />
        {errors.displayName ? <small>{errors.displayName}</small> : null}
      </label>

      <label>
        <span>Email</span>
        <input autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
        {errors.email ? <small>{errors.email}</small> : null}
      </label>

      <label>
        <span>Password</span>
        <input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" />
        <PasswordStrengthIndicator score={strength.score} label={strength.label} />
        {errors.password ? <small>{errors.password}</small> : null}
      </label>

      <label>
        <span>Confirm Password</span>
        <input autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" />
        {errors.confirmPassword ? <small>{errors.confirmPassword}</small> : null}
      </label>

      <label>
        <span>Company / Organization</span>
        <input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Acme Operations" />
        {errors.organizationName ? <small>{errors.organizationName}</small> : null}
      </label>

      <button className="redios-auth-primary" disabled={auth.loading} type="submit">
        {auth.loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="redios-auth-switch">
        Already have account? <a href="/login">Login</a>
      </p>

      <p className="redios-auth-todo">
        TODO: Registration eventually maps REGISTER_FORM Metadata {'->'} USER.REGISTER Action {'->'} Identity Runtime {'->'} USER System Object.
      </p>
    </form>
  );
}

function PasswordStrengthIndicator({ label, score }: { label: string; score: number }) {
  return (
    <div className="redios-password-strength" data-score={score}>
      <i aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function validateRegister(input: {
  confirmPassword: string;
  displayName: string;
  email: string;
  organizationName: string;
  password: string;
}) {
  const errors: RegisterErrors = {};

  if (!input.displayName.trim()) {
    errors.displayName = 'Full name is required.';
  }

  if (!input.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(input.email)) {
    errors.email = 'Use a valid email address.';
  }

  if (input.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!input.organizationName.trim()) {
    errors.organizationName = 'Company or organization is required.';
  }

  return errors;
}

function passwordStrength(password: string) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  if (score >= 4) {
    return { label: 'Strong password', score };
  }

  if (score >= 2) {
    return { label: 'Medium password', score };
  }

  return { label: password ? 'Weak password' : 'Password strength', score };
}
