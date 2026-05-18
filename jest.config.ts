import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.spec.ts',
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.tsx',
    '**/__tests__/**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.spec.tsx',
    '**/*.test.tsx',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.jest.json',
    }],
  },
};

export default config;
