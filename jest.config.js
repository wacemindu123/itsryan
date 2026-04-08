/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
