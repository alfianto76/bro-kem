import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import type { Movie } from "../domain/movie.js";

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function absoluteUrl(value: string | undefined, pageUrl: string): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value.trim(), pageUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function createMovieId(title: string, posterUrl: string | undefined, index: number): string {
  return createHash("sha256")
    .update(`${title}|${posterUrl ?? ""}|${index}`)
    .digest("hex")
    .slice(0, 16);
}

export function parseMovieCatalog(
  html: string,
  pageUrl: string,
  itemSelector = "article"
): Movie[] {
  const $ = cheerio.load(html);
  const items = $(itemSelector);
  const roots = items.length > 0 ? items.toArray() : [$.root().get(0)];

  return roots.flatMap((element, index) => {
    const root = $(element);
    const title = cleanText(root.find("h1").first().text());
    if (!title) return [];

    const image = root.find("img").first();
    const rawPoster = image.attr("src") ?? image.attr("data-src");
    const posterUrl = absoluteUrl(rawPoster, pageUrl);
    const overview = cleanText(root.find("p").first().text());

    return [{
      id: createMovieId(title, posterUrl, index),
      title,
      overview,
      ...(posterUrl ? { posterUrl } : {}),
      genres: []
    }];
  });
}
