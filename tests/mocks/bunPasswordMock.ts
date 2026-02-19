export const password = {
  hash: async (input: string, options?: any) => {
    // Simple mock implementation - in real tests this would be mocked with vi.fn()
    return `hashed_${input}`;
  },
  verify: async (input: string, hash: string) => {
    // Simple mock implementation - in real tests this would be mocked with vi.fn()
    return input === hash.replace('hashed_', '');
  },
};