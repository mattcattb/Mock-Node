import createConfig from "@reroll/eslint-config/create-config";
import drizzle from "eslint-plugin-drizzle";

export default createConfig({
  ignores: ["src/db/migrations/*", "public/*"],
  plugins: { drizzle },
  rules: {
    "prefer-const": "off",
  },
});
