import { Readable } from "node:stream";
import express from "express";

import {
  fetchConfig,
  fetchProject,
  fetchCDNPage,
  transformCDNPage,
  updateLink,
} from "./loader.mjs";
import { renderPage } from "./renderer.mjs";

const CDN_HOST = new URL("http://localhost:3100");

const app = express();
const port = 3001;

function buildHostURL(request: express.Request): string {
  return `${request.protocol}://${request.host}`;
}

// Build assets
app.use("/build", express.static("public"));

// CDN assets
app.get("/static/*path", async (req, res) => {
  const path = req.params.path;
  const cdnURL = new URL(path.join("/"), CDN_HOST);
  let cdnResponse;
  try {
    cdnResponse = await fetch(cdnURL);
  } catch (e) {
    return res.status(404).send(String(e));
  }

  res.setHeaders(new Headers(cdnResponse.headers));
  // FIXME assert
  Readable.fromWeb(cdnResponse.body!).pipe(res);
});

// CDN assets
app.get("/favicon.ico", async (req, res) => {
  const config = await fetchConfig(CDN_HOST);
  // Get favicon URL
  const configURL = config.options?.favicon || "https://mystmd.org/favicon.ico";
  const url = updateLink(configURL, buildHostURL(req));

  const response = await fetch(url).catch(console.error);
  if (!response || response.status === 404) {
    res.status(404);
    return;
  }
  const contentType = response.headers.get("Content-Type");
  if (contentType === undefined) {
    res.status(500);
    return;
  }
  res.setHeaders(new Headers(response.headers));
  res.format({
    [contentType as string]() {
      Readable.fromWeb(response.body!).pipe(res);
    },
  });
});

// Page JSON
app.get("/:slug.json", async (req, res) => {
  const slug = req.params.slug!;

  // Try to fetch the page
  let cdnPage;
  try {
    cdnPage = await fetchCDNPage(CDN_HOST, slug);
  } catch (e) {
    res.status(404).send(String(e));
    return;
  }
  res.json(await transformCDNPage(cdnPage, buildHostURL(req)));
});

// Page HTML
app.get("/{*slug}", async (req, res) => {
  const project = await fetchProject(CDN_HOST);
  const parts = req.params.slug ?? [];
  const slug = parts.length ? parts.join(".") : project.index;

  // Try to fetch the page
  let cdnPage;
  try {
    cdnPage = await fetchCDNPage(CDN_HOST, slug);
  } catch (e) {
    res.status(404).send(String(e));
    return;
  }
  const pageJSON = await transformCDNPage(cdnPage, buildHostURL(req));
  res.send(await renderPage(pageJSON));
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
