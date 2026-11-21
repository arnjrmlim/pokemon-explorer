
module.exports = {
  root: true,

  env: {
    browser: true,
    es2020: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
  ],

  ignorePatterns: [
    "dist",
    "node_modules",
    ".eslintrc.cjs",
  ],

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },

  rules: {},
};
