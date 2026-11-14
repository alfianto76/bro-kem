import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { DemoCatalogProvider } from "../src/providers/demo-catalog-provider.js";

const config = loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" });
const app = createApp(config, new DemoCatalogProvider());

describe("API", () => {
  it("reports health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("lists demo movies", async () => {
    const response = await request(app).get("/api/movies");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});
