import { Readable } from "node:stream";
import express from "express";

import { fetchProject, fetchCDNPage, transformCDNPage } from "./loader.mjs";
import { renderPage } from "./renderer.mjs";

const CDN_HOST = new URL("http://localhost:3100");

const app = express();
const port = 3001;

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
  // FIXME assert
  Readable.fromWeb(cdnResponse.body!).pipe(res);
});

// CDN assets
app.get("/favicon.ico", async (req, res) => {
  // For now, temporarily use MyST favicon
  res.redirect("https://mystmd.org/favicon.ico");
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
  res.json(await transformCDNPage(cdnPage));
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
  const pageJSON = await transformCDNPage(cdnPage);
  res.send(await renderPage(pageJSON));
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
