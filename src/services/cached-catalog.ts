import type { Movie } from "../domain/movie.js";
import type { CatalogProvider } from "../providers/catalog-provider.js";

type CacheEntry<T> = { expiresAt: number; value: T };

export class CachedCatalog implements CatalogProvider {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(
    private readonly source: CatalogProvider,
    private readonly ttlMilliseconds: number
  ) {}

  list(): Promise<Movie[]> {
    return this.remember("list", () => this.source.list());
  }

  findById(id: string): Promise<Movie | null> {
    return this.remember(`movie:${id}`, () => this.source.findById(id));
  }

  search(query: string): Promise<Movie[]> {
    return this.remember(`search:${query.toLocaleLowerCase()}`, () => this.source.search(query));
  }

  private async remember<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = await factory();
    this.cache.set(key, { expiresAt: Date.now() + this.ttlMilliseconds, value });
    return value;
  }
}
