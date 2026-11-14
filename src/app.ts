import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { ZodError } from "zod";
import type { AppConfig } from "./config.js";
import type { CatalogProvider } from "./providers/catalog-provider.js";
import { createMovieRouter } from "./routes/movies.js";

export function createApp(config: AppConfig, catalog: CatalogProvider) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(pinoHttp({ level: config.LOG_LEVEL }));
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN === "*" ? "*" : config.CORS_ORIGIN.split(",") }));
  app.use(express.json({ limit: "100kb" }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", uptime: process.uptime() });
  });
  app.use("/api/movies", createMovieRouter(catalog));

  app.use((_request, response) => response.status(404).json({ error: "Not found" }));

  const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
    request.log.error({ err: error }, "request failed");
    if (error instanceof ZodError) {
      response.status(400).json({ error: "Invalid request", details: error.issues });
      return;
    }
    response.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  return app;
}
