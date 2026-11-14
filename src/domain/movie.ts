import { z } from "zod";

export const movieSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  overview: z.string().default(""),
  year: z.number().int().min(1888).max(2200).optional(),
  posterUrl: z.string().url().optional(),
  backdropUrl: z.string().url().optional(),
  genres: z.array(z.string()).default([])
});

export const movieListSchema = z.array(movieSchema);
export type Movie = z.infer<typeof movieSchema>;
