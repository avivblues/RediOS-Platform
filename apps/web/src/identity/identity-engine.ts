import type { RuntimeContext } from '../core/renderer/runtime-types';
import { loadRuntimeRecords, saveRuntimeRecords, upsertRuntimeRecord, type RuntimeRecord } from '../runtime/runtime-record-store';

export const REDIOS_ADMIN_APP_CODE = 'REDIOS_ADMIN';
export const REDIOS_ADMIN_APP_SLUG = 'redios-admin';
export const USER_OBJECT_CODE = 'USER';

const SESSION_KEY = 'redios:identity:session';
const SYSTEM_USER_ID = 'user_admin';

export interface IdentitySession {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  permissions: string[];
  roles: string[];
  createdAt: string;
}

export class PasswordProvider {
  hash(password: string) {
    return `redios-password-v1:${hexEncode(password)}`;
  }

  verify(password: string, passwordHash: unknown) {
    return this.hash(password) === String(passwordHash ?? '');
  }
}

export class SessionEngine {
  createSession(user: RuntimeRecord): IdentitySession {
    const session: IdentitySession = {
      id: `session_${Date.now()}`,
      userId: String(user.id),
      email: String(user.email ?? ''),
      displayName: String(user.displayName ?? user.username ?? user.email ?? 'Runtime User'),
      permissions: ['*'],
      roles: ['ADMIN'],
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  currentSession(): IdentitySession | undefined {
    try {
      const rawValue = window.localStorage.getItem(SESSION_KEY);
      return rawValue ? JSON.parse(rawValue) as IdentitySession : undefined;
    } catch {
      return undefined;
    }
  }

  clearSession() {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export class IdentityEngine {
  constructor(
    private readonly passwordProvider = new PasswordProvider(),
    private readonly sessionEngine = new SessionEngine(),
  ) {}

  ensureSeedData() {
    const users = this.listUsers();
    const adminExists = users.some((user) => String(user.email) === 'admin@redios.local');

    if (adminExists) {
      return;
    }

    upsertRuntimeRecord(REDIOS_ADMIN_APP_SLUG, USER_OBJECT_CODE, {
      id: SYSTEM_USER_ID,
      email: 'admin@redios.local',
      username: 'admin',
      passwordHash: this.passwordProvider.hash('admin123'),
      displayName: 'RediOS Admin',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      createdBy: 'REDIOS',
      updatedAt: new Date().toISOString(),
      updatedBy: 'REDIOS',
    });
  }

  login(input: Record<string, unknown>) {
    this.ensureSeedData();
    const loginId = String(input.email ?? input.username ?? '').trim().toLowerCase();
    const password = String(input.password ?? input.passwordHash ?? '');
    const user = this.listUsers().find((candidate) => {
      const email = String(candidate.email ?? '').toLowerCase();
      const username = String(candidate.username ?? '').toLowerCase();
      return email === loginId || username === loginId;
    });

    if (!user || !this.passwordProvider.verify(password, user.passwordHash)) {
      throw new Error('Email/username atau password tidak valid.');
    }

    if (String(user.status ?? 'ACTIVE') !== 'ACTIVE') {
      throw new Error('User tidak aktif.');
    }

    return this.sessionEngine.createSession(user);
  }

  executeCapability(actionCode: string, payload: Record<string, unknown>, context?: RuntimeContext) {
    if (actionCode === 'AUTH.LOGIN') {
      return this.login(payload);
    }

    if (actionCode === 'USER.REGISTER' || actionCode === 'USER.CREATE') {
      return this.createUser(payload, context);
    }

    if (actionCode === 'USER.UPDATE') {
      return this.updateUser(payload, context);
    }

    if (actionCode === 'USER.DISABLE') {
      return this.disableUser(payload, context);
    }

    if (actionCode === 'USER.DELETE') {
      return this.deleteUser(payload, context);
    }

    if (actionCode === 'USER.LIST') {
      return this.listUsers();
    }

    if (actionCode === 'USER.GET') {
      return this.getUser(String(payload.id ?? ''));
    }

    return undefined;
  }

  listUsers() {
    return loadRuntimeRecords(REDIOS_ADMIN_APP_SLUG, USER_OBJECT_CODE);
  }

  getUser(id: string) {
    return this.listUsers().find((user) => String(user.id) === id);
  }

  private createUser(payload: Record<string, unknown>, context?: RuntimeContext) {
    this.assertUniqueIdentity(payload);
    const now = new Date().toISOString();
    const user = normalizeUserPayload(payload);
    const record = upsertRuntimeRecord(REDIOS_ADMIN_APP_SLUG, USER_OBJECT_CODE, {
      ...user,
      id: String(user.id ?? `USER_${Date.now()}`),
      passwordHash: this.passwordProvider.hash(String(payload.password ?? payload.passwordHash ?? '')),
      status: String(user.status ?? 'ACTIVE'),
      createdAt: now,
      createdBy: context?.userId ?? 'REDIOS',
      updatedAt: now,
      updatedBy: context?.userId ?? 'REDIOS',
    });

    return record;
  }

  private updateUser(payload: Record<string, unknown>, context?: RuntimeContext) {
    const id = String(payload.id ?? '').trim();
    const current = id ? this.getUser(id) : this.findByIdentity(payload);

    if (!current) {
      throw new Error('User runtime record tidak ditemukan.');
    }

    const now = new Date().toISOString();
    const nextPayload = normalizeUserPayload(payload);
    const nextRecord = {
      ...current,
      ...nextPayload,
      id: current.id,
      passwordHash: payload.password || payload.passwordHash
        ? this.passwordProvider.hash(String(payload.password ?? payload.passwordHash))
        : current.passwordHash,
      updatedAt: now,
      updatedBy: context?.userId ?? 'REDIOS',
    };

    return upsertRuntimeRecord(REDIOS_ADMIN_APP_SLUG, USER_OBJECT_CODE, nextRecord);
  }

  private disableUser(payload: Record<string, unknown>, context?: RuntimeContext) {
    const target = this.getUser(String(payload.id ?? '')) ?? this.findByIdentity(payload);

    if (!target) {
      throw new Error('User runtime record tidak ditemukan.');
    }

    return this.updateUser({
      ...target,
      status: 'INACTIVE',
      updatedBy: context?.userId ?? 'REDIOS',
    }, context);
  }

  private deleteUser(payload: Record<string, unknown>, context?: RuntimeContext) {
    const target = this.getUser(String(payload.id ?? '')) ?? this.findByIdentity(payload);

    if (!target) {
      throw new Error('User runtime record tidak ditemukan.');
    }

    const nextRecords = this.listUsers().filter((user) => String(user.id) !== String(target.id));
    saveRuntimeRecords(REDIOS_ADMIN_APP_SLUG, USER_OBJECT_CODE, nextRecords);
    return { ...target, deletedBy: context?.userId ?? 'REDIOS', deletedAt: new Date().toISOString() };
  }

  private assertUniqueIdentity(payload: Record<string, unknown>) {
    const email = String(payload.email ?? '').toLowerCase();
    const username = String(payload.username ?? '').toLowerCase();
    const duplicate = this.listUsers().find((user) => {
      return String(user.email ?? '').toLowerCase() === email || String(user.username ?? '').toLowerCase() === username;
    });

    if (duplicate) {
      throw new Error('Email atau username sudah dipakai.');
    }
  }

  private findByIdentity(payload: Record<string, unknown>) {
    const email = String(payload.email ?? '').toLowerCase();
    const username = String(payload.username ?? '').toLowerCase();
    return this.listUsers().find((user) => {
      return (email && String(user.email ?? '').toLowerCase() === email)
        || (username && String(user.username ?? '').toLowerCase() === username);
    });
  }
}

function normalizeUserPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key]) => !['password', '__runtimeAction'].includes(key))
      .filter(([, value]) => value !== undefined && value !== ''),
  );
}

function hexEncode(value: string) {
  return Array.from(value).map((char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}
