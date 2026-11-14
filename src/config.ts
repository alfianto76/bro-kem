import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(5376),
  LOG_LEVEL: z.string().default("info"),
  CORS_ORIGIN: z.string().default("*"),
  CATALOG_API_URL: z.string().url().optional().or(z.literal("")),
  CATALOG_API_TOKEN: z.string().optional(),
  SCRAPER_SOURCE_URL: z.string().url().optional().or(z.literal("")),
  SCRAPER_ITEM_SELECTOR: z.string().min(1).default("article"),
  SCRAPER_TIMEOUT_MS: z.coerce.number().int().positive().max(30_000).default(10_000),
  CACHE_TTL_SECONDS: z.coerce.number().int().nonnegative().default(300)
});

export type AppConfig = z.infer<typeof environmentSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return environmentSchema.parse(environment);
}
