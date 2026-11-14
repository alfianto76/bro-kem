import type { Movie } from "../domain/movie.js";

export interface CatalogProvider {
  list(): Promise<Movie[]>;
  findById(id: string): Promise<Movie | null>;
  search(query: string): Promise<Movie[]>;
}
