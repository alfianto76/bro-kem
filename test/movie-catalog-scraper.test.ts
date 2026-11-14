import { describe, expect, it } from "vitest";
import { parseMovieCatalog } from "../src/scrapers/movie-catalog-scraper.js";

const html = `
  <main>
    <article>
      <h1>  Film Pertama  </h1>
      <img src="/images/pertama.jpg" alt="Film Pertama">
      <p>Sinopsis   film pertama.</p>
    </article>
    <article>
      <h1>Film Kedua</h1>
      <img data-src="https://cdn.example.com/kedua.jpg">
      <p>Sinopsis film kedua.</p>
    </article>
    <article><p>Item tanpa judul harus dilewati.</p></article>
  </main>
`;

describe("parseMovieCatalog", () => {
  it("maps h1, img, and p elements to clean movie JSON", () => {
    const movies = parseMovieCatalog(html, "https://catalog.example.com/latest");

    expect(movies).toHaveLength(2);
    expect(movies[0]).toMatchObject({
      title: "Film Pertama",
      posterUrl: "https://catalog.example.com/images/pertama.jpg",
      overview: "Sinopsis film pertama.",
      genres: []
    });
    expect(movies[0]?.id).toMatch(/^[a-f0-9]{16}$/);
    expect(movies[1]?.posterUrl).toBe("https://cdn.example.com/kedua.jpg");
  });

  it("falls back to parsing a single document without article wrappers", () => {
    const movies = parseMovieCatalog(
      "<h1>Film Tunggal</h1><img src='/poster.jpg'><p>Ringkas.</p>",
      "https://catalog.example.com/movie/1"
    );

    expect(movies).toHaveLength(1);
    expect(movies[0]?.title).toBe("Film Tunggal");
  });
});
