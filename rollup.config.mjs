import typescript from "@rollup/plugin-typescript";
import packageJson from "./package.json" assert { type: "json" };

export default {
  input: "src/index.ts",
  output: [
    {
      file: packageJson.module,
      format: "esm",
    },
    {
      file: packageJson.main,
      format: "cjs",
    },
  ],
  plugins: [typescript()],
};
