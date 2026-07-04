import { DataSource } from "typeorm";
import { config } from "dotenv";

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ["src/**/*.entity.ts"],
  migrationsRun: true,
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: true,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});
