import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../context/AuthProvider';

export function ProfilePage() {
  const auth = useAuth();
  const session = auth.session;
  const currentUser = auth.currentUser;

  if (!session) {
    return (
      <AuthLayout
        eyebrow="User Profile"
        subtitle="Your profile is loaded from the active identity session."
        title="Sign in required"
      >
        <section className="redios-auth-form redios-auth-success">
          <span>Session</span>
          <h2>No active session</h2>
          <p>Please login before opening your RediOS profile.</p>
          <button className="redios-auth-primary" type="button" onClick={() => { window.location.href = '/login'; }}>Go to Login</button>
        </section>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="User Profile"
      subtitle="Profile data is resolved from the current session and USER system metadata runtime record."
      title="RediOS User Profile"
    >
      <section className="redios-auth-form redios-profile-card">
        <div className="redios-profile-heading">
          <span aria-hidden="true">{initials(session.displayName)}</span>
          <div>
            <strong>{session.displayName}</strong>
            <small>{session.email}</small>
          </div>
        </div>

        <div className="redios-profile-grid">
          <ProfileItem label="User ID" value={session.userId} />
          <ProfileItem label="Session ID" value={session.id} />
          <ProfileItem label="Roles" value={session.roles.join(', ')} />
          <ProfileItem label="Permissions" value={session.permissions.join(', ')} />
          <ProfileItem label="Status" value={String(currentUser?.status ?? 'ACTIVE')} />
          <ProfileItem label="Created At" value={String(currentUser?.createdAt ?? session.createdAt)} />
        </div>

        <div className="redios-profile-actions">
          <button type="button" onClick={() => { window.location.href = '/apps/redios-admin'; }}>Back to Admin</button>
          <button className="redios-auth-primary" type="button" onClick={() => {
            auth.logout();
            window.location.href = '/login';
          }}
          >
            Logout
          </button>
        </div>
      </section>
    </AuthLayout>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'RU';
}
