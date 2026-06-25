import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "extension/**/*.js", "extension/content/**", "extension/background/**", "extension/popup/**"]
  }
];

export default config;
