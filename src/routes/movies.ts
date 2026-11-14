import { Router } from "express";
import { z } from "zod";
import type { CatalogProvider } from "../providers/catalog-provider.js";

const searchSchema = z.object({ q: z.string().trim().min(1).max(100) });

export function createMovieRouter(catalog: CatalogProvider): Router {
  const router = Router();

  router.get("/", async (_request, response, next) => {
    try {
      response.json({ data: await catalog.list() });
    } catch (error) {
      next(error);
    }
  });

  router.get("/search", async (request, response, next) => {
    try {
      const { q } = searchSchema.parse(request.query);
      response.json({ data: await catalog.search(q) });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (request, response, next) => {
    try {
      const movie = await catalog.findById(request.params.id);
      if (!movie) return response.status(404).json({ error: "Movie not found" });
      return response.json({ data: movie });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
