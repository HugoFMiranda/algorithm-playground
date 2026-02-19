export default [
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    rules: {
      "no-undef": "error",
      "no-unused-vars": "error",
    },
  },
];
