import { defineConfig } from "orval";

export default defineConfig({
  petstore: {
    input: "../back-end/api/openapi.yaml",
    output: {
      target: "./src/lib/api/generated.ts",
      schemas: "./src/model/",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/api/mutator/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
