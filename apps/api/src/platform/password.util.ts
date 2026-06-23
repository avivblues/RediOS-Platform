function hexEncode(value: string): string {
  return Array.from(value)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

export function hashPlatformPassword(password: string): string {
  return `redios-password-v1:${hexEncode(password)}`;
}

export function verifyPlatformPassword(password: string, passwordHash: string): boolean {
  return hashPlatformPassword(password) === passwordHash;
}
