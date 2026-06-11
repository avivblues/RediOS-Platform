const friendlyErrors: Record<string, string> = {
  FORM_RELATION_NOT_FOUND: 'This connection points to information that no longer exists.',
  FORM_VIEW_NOT_FOUND: 'This screen points to a list that no longer exists.',
  ENTITY_NOT_FOUND: 'This item points to a data object that no longer exists.',
  RELATION_NOT_FOUND: 'This connection is missing.',
};

export function humanizeStudioError(message: string): string {
  const match = Object.keys(friendlyErrors).find((code) => message.includes(code));
  return match ? friendlyErrors[match] : 'Something needs attention before Studio can continue.';
}
