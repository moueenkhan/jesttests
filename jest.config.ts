import type { Config } from '@jest/types';

// Jest configuration object
const config: Config.InitialOptions = {
  // Preset for handling TypeScript files
  preset: 'ts-jest',

  // Test environment setup to mimic a Node.js environment
  testEnvironment: 'node',

  // Transform property to use ts-jest for TypeScript files
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Reporters to generate test results in various formats
  reporters: [
    "default",  // Default reporter for console output
    [
      "jest-html-reporter", // HTML reporter for generating detailed test reports
      {
        "pageTitle": "Test Report", // Title of the HTML report
        "outputPath": "./reports/test-report.html", // Path to save the HTML report
        "includeFailureMsg": true, // Include failure messages in the report
      }
    ]
  ],

  // Directory to search for test files
  testMatch: [
    '**/__tests__/**/*.ts?(x)', // All TypeScript files inside __tests__ directory
    '**/?(*.)+(spec|test).ts?(x)' // All TypeScript files with .spec.ts or .test.ts suffix
  ],

  // Module file extensions to be used in module resolution
  moduleFileExtensions: [
    'ts', 'tsx', // TypeScript files
    'js', 'jsx', // JavaScript files
    'json', // JSON files
    'node' // Node.js modules
  ],

  // Directory to collect code coverage information
  collectCoverage: true,

  // Directory where Jest should output its coverage files
  coverageDirectory: './coverage',

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', // All TypeScript files in the src directory
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json', // JSON format coverage report
    'lcov', // lcov format coverage report
    'text', // Plain text coverage report
    'clover' // Clover format coverage report
  ],
};

export default config;
