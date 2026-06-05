import { Readable } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "url";
import express from "express";

import { fetchProject, fetchCDNPage, transformCDNPage } from "./loader.mjs";
import { renderPage } from "./renderer.mjs";

const CDN_HOST = new URL("http://localhost:3100");

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", async (req, res) => {
  const project = await fetchProject(CDN_HOST);
  const index = project.index;

  const cdnPage = await fetchCDNPage(CDN_HOST, index);
  const pageJSON = await transformCDNPage(cdnPage);
  const html = await renderPage(pageJSON);
  res.send(html);
});
// Static assets
app.use("/build", express.static(path.join(__dirname, "static")));

// Static assets
app.get("/static/*path", async (req, res) => {
  const path = req.params.path;
  const cdnURL = new URL(path.join("/"), CDN_HOST);
  const cdnResponse = await fetch(cdnURL);
  // FIXME assert
  Readable.fromWeb(cdnResponse.body!).pipe(res);
});

// Page JSON
app.get("/*slug.json", async (req, res) => {
  const [slug] = req.params.slug;

  const cdnPage = await fetchCDNPage(CDN_HOST, slug);
  const pageJSON = await transformCDNPage(cdnPage);
  res.json(pageJSON);
});

// Page HTML
app.get("/*slug", async (req, res) => {
  const [slug] = req.params.slug;

  const cdnPage = await fetchCDNPage(CDN_HOST, slug);
  const pageJSON = await transformCDNPage(cdnPage);
  const html = await renderPage(pageJSON);
  res.send(html);
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
