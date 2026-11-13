import {
  clearMemoryUsersForTests,
  createUser,
  deleteUserById,
  findUserByEmailWithPassword,
  findUserById,
  rotateUserRefreshToken,
} from '../services/userStore.js';
import { resetDataMode } from '../lib/dataMode.js';

describe('memory user store', () => {
  beforeEach(() => {
    resetDataMode();
    clearMemoryUsersForTests();
  });

  it('supports a complete password and refresh-token lifecycle without MongoDB', async () => {
    const user = await createUser({
      email: 'memory@example.com',
      password: 'StrongPass123',
      name: 'Memory User',
      role: 'mentee',
      emailVerified: true,
    });

    expect(await user.comparePassword('StrongPass123')).toBe(true);
    expect(user.toJSON()).not.toHaveProperty('password');
    expect(await findUserByEmailWithPassword('MEMORY@example.com')).toBe(user);

    await user.addRefreshToken('first-refresh');
    expect(await rotateUserRefreshToken(user._id, 'first-refresh', 'next-refresh')).toBe(user);
    expect(await rotateUserRefreshToken(user._id, 'first-refresh', 'replay')).toBeNull();

    expect((await deleteUserById(user._id)).deletedCount).toBe(1);
    expect(await findUserById(user._id)).toBeNull();
  });
});
