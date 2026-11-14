import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { DemoCatalogProvider } from "./providers/demo-catalog-provider.js";
import { CheerioCatalogProvider } from "./providers/cheerio-catalog-provider.js";
import { HttpCatalogProvider } from "./providers/http-catalog-provider.js";
import { CachedCatalog } from "./services/cached-catalog.js";

const config = loadConfig();
const source = config.SCRAPER_SOURCE_URL
  ? new CheerioCatalogProvider(
      config.SCRAPER_SOURCE_URL,
      config.SCRAPER_ITEM_SELECTOR,
      config.SCRAPER_TIMEOUT_MS
    )
  : config.CATALOG_API_URL
    ? new HttpCatalogProvider(config.CATALOG_API_URL, config.CATALOG_API_TOKEN)
    : new DemoCatalogProvider();
const catalog = new CachedCatalog(source, config.CACHE_TTL_SECONDS * 1000);
const app = createApp(config, catalog);

const server = app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${config.PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received; shutting down`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
