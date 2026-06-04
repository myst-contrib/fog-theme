import { Environment } from "minijinja-js";
import express from "express";

import entrypointTemplate from "./templates/entrypoint.j2.html" with { type: "text" };
import renderersTemplate from "./templates/renderers.j2.html" with { type: "text" };

const CDN_HOST = "http://localhost:3100";

const app = express();
const port = 3000;

type Page = any;
type Config = any;

async function fetchConfig(): Promise<Config> {
  const response = await fetch(`${CDN_HOST}/config.json`);
  return await response.json();
}

async function fetchProject(): Promise<Page> {
  const config = await fetchConfig();
  const projects = config.projects;
  if (projects.length !== 1) {
    throw new Error();
  }
  return projects[0];
}

async function fetchPageContent(slug: string): Promise<Page> {
  const response = await fetch(`${CDN_HOST}/content/${slug}.json`);
  return await response.json();
}

async function renderPage(content: Page): Promise<string> {
  const env = new Environment();

  env.addTemplate("entrypoint.j2.html", entrypointTemplate);
  env.addTemplate("renderers.j2.html", renderersTemplate);

  return env.renderTemplate("entrypoint.j2.html", content);
}

app.get("/", async (req, res) => {
  const project = await fetchProject();
  const index = project.index;
  const indexJson = await fetchPageContent(index);
  const html = await renderPage(indexJson);
  res.send(html);
});

app.get("/*slug.json", async (req, res) => {
  const [slug] = req.params.slug;

  const pageJson = await fetchPageContent(slug);
  res.json(pageJson);
});

app.get("/*slug", async (req, res) => {
  const [slug] = req.params.slug;

  const pageJson = await fetchPageContent(slug);
  const html = await renderPage(pageJson);
  res.send(html);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
