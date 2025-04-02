module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"], // Include .tsx and .jsx
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"], // Match .test.tsx files
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Use ts-jest for .ts and .tsx files
  },
  moduleNameMapper: {
    "^@/(.+)": "<rootDir>/src/$1", // Maps @/src/utility to <project_root>/src/utility
  },
};
