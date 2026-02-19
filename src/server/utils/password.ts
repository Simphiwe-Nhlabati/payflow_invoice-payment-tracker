/**
 * Password utilities that abstract Bun.password for easier testing
 */

export const passwordUtils = {
  hash: async (input: string, options?: any) => {
    // In production, use Bun.password
    if (typeof Bun !== 'undefined' && Bun?.password) {
      return await Bun.password.hash(input, options || {
        algorithm: "argon2id",
        memoryCost: 19456,
        timeCost: 2,
      });
    } else {
      // Fallback for testing environments
      // In real tests, this will be mocked
      throw new Error('Bun.password not available. This should be mocked in tests.');
    }
  },

  verify: async (input: string, hash: string) => {
    // In production, use Bun.password
    if (typeof Bun !== 'undefined' && Bun?.password) {
      return await Bun.password.verify(input, hash);
    } else {
      // Fallback for testing environments
      // In real tests, this will be mocked
      throw new Error('Bun.password not available. This should be mocked in tests.');
    }
  }
};