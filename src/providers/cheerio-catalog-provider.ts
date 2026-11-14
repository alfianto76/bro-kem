import axios, { type AxiosInstance } from "axios";
import type { Movie } from "../domain/movie.js";
import { parseMovieCatalog } from "../scrapers/movie-catalog-scraper.js";
import type { CatalogProvider } from "./catalog-provider.js";

export class CheerioCatalogProvider implements CatalogProvider {
  private readonly client: AxiosInstance;

  constructor(
    private readonly sourceUrl: string,
    private readonly itemSelector = "article",
    timeoutMilliseconds = 10_000
  ) {
    this.client = axios.create({
      timeout: timeoutMilliseconds,
      maxContentLength: 2_000_000,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "AuthorizedMovieCatalogBot/1.0"
      },
      responseType: "text"
    });
  }

  async list(): Promise<Movie[]> {
    const response = await this.client.get<string>(this.sourceUrl);
    return parseMovieCatalog(response.data, this.sourceUrl, this.itemSelector);
  }

  async findById(id: string): Promise<Movie | null> {
    const movies = await this.list();
    return movies.find((movie) => movie.id === id) ?? null;
  }

  async search(query: string): Promise<Movie[]> {
    const normalizedQuery = query.toLocaleLowerCase();
    const movies = await this.list();
    return movies.filter((movie) => movie.title.toLocaleLowerCase().includes(normalizedQuery));
  }
}
