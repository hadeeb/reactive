module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["react-app", "plugin:prettier/recommended"],
  plugins: ["react-hooks", "simple-import-sort"],
  rules: {
    "simple-import-sort/sort": "error"
  }
};
