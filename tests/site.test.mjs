import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { contact } from "../config.js";
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
test("all local page links and image assets resolve", async () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (url.startsWith("#")) assert.ok(ids.has(url.slice(1)), url);
    else if (!/^https?:/.test(url)) {
      const [file, fragment] = url.split("#");
      await access(new URL("../" + file, import.meta.url));
      if (fragment)
        assert.ok(
          (
            await readFile(new URL("../" + file, import.meta.url), "utf8")
          ).includes(`id="${fragment}"`),
        );
    }
  }
});
test("page metadata and a single primary heading are present", () => {
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
  for (const key of [
    'name="description"',
    'property="og:title"',
    'property="og:description"',
    'rel="icon"',
    'lang="en-NZ"',
  ])
    assert.ok(html.includes(key), key);
});
test("unsupplied contact information remains unconfigured", () => {
  for (const value of Object.values(contact)) assert.equal(value, "");
});
