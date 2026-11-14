import { movieListSchema, movieSchema, type Movie } from "../domain/movie.js";
import type { CatalogProvider } from "./catalog-provider.js";

export class HttpCatalogProvider implements CatalogProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly token?: string
  ) {}

  async list(): Promise<Movie[]> {
    return movieListSchema.parse(await this.request("/movies"));
  }

  async findById(id: string): Promise<Movie | null> {
    const response = await fetch(new URL(`/movies/${encodeURIComponent(id)}`, this.baseUrl), {
      headers: this.headers()
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
    return movieSchema.parse(await response.json());
  }

  async search(query: string): Promise<Movie[]> {
    const url = new URL("/movies/search", this.baseUrl);
    url.searchParams.set("q", query);
    return movieListSchema.parse(await this.request(url));
  }

  private async request(path: string | URL): Promise<unknown> {
    const url = path instanceof URL ? path : new URL(path, this.baseUrl);
    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
    return response.json();
  }

  private headers(): HeadersInit {
    return this.token ? { authorization: `Bearer ${this.token}` } : {};
  }
}
