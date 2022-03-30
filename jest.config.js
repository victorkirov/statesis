module.exports = {
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.ts?$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.ts'],
  testRegex: '/src/.*\\.(test|Test)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  coverageReporters: ['json', 'html', 'text'],
  setupFilesAfterEnv: [
    'jest-extended',
  ],
}
