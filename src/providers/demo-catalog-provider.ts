import type { Movie } from "../domain/movie.js";
import type { CatalogProvider } from "./catalog-provider.js";

const demoMovies: Movie[] = [
  {
    id: "demo-1",
    title: "Sample Movie",
    overview: "Replace this demo provider with an API or feed you are authorized to use.",
    year: 2026,
    genres: ["Demo"]
  }
];

export class DemoCatalogProvider implements CatalogProvider {
  async list(): Promise<Movie[]> {
    return demoMovies;
  }

  async findById(id: string): Promise<Movie | null> {
    return demoMovies.find((movie) => movie.id === id) ?? null;
  }

  async search(query: string): Promise<Movie[]> {
    const normalizedQuery = query.toLocaleLowerCase();
    return demoMovies.filter((movie) => movie.title.toLocaleLowerCase().includes(normalizedQuery));
  }
}
