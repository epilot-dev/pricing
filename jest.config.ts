import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  clearMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  testPathIgnorePatterns: ['node_modules'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['__tests__', 'node_modules'],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  maxWorkers: '50%',
  verbose: true,
  silent: false,
  forceExit: true,
  coverageDirectory: '<rootDir>/coverage/',
};

export default config;
