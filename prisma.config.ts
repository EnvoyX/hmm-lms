import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { env as envConfig } from "./src/env";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      envConfig.NODE_ENV === "development"
        ? env("DIRECT_URL")
        : env("DATABASE_URL"),
  },
});
