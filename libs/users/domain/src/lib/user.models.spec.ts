import type { UserIdentity } from './user.models';

describe('UserIdentity', () => {
  it('supports explicit administrative roles', () => {
    const user: UserIdentity = {
      id: 'user-1',
      displayName: 'Admin',
      email: 'admin@example.test',
      roles: ['admin'],
    };
    expect(user.roles).toContain('admin');
  });
});
