import type { Config, Page, Node } from "./types.mjs";

import { selectAll } from "unist-util-select";

export async function fetchConfig(cdn: URL): Promise<Config> {
  const response = await fetch(new URL(`/config.json`, cdn));
  return await response.json();
}

export async function fetchProject(cdn: URL): Promise<Page> {
  const config = await fetchConfig(cdn);
  const projects = config.projects;
  if (projects.length !== 1) {
    throw new Error();
  }
  return projects[0];
}

export async function fetchCDNPage(cdn: URL, slug: string): Promise<Page> {
  const response = await fetch(new URL(`/content/${slug}.json`, cdn));
  return await response.json();
}

function rewriteStaticLinks(mdast: Node, updateUrl: (arg0: string) => string) {
  // Fix all of the images to point to the CDN
  const images = selectAll("image", mdast) as Node[];
  images.forEach((node) => {
    node.url = updateUrl(node.url);
    if (node.urlOptimized) {
      node.urlOptimized = updateUrl(node.urlOptimized);
    }
  });
  const widgets = selectAll("anywidget", mdast) as Node[];
  widgets.forEach((node) => {
    node.esm = updateUrl(node.esm);
    if (node.css) {
      node.css = updateUrl(node.css);
    }
  });
  const links = selectAll("link,linkBlock,card", mdast) as Node[];
  const staticLinks = links?.filter((node) => node.static);
  staticLinks.forEach((node) => {
    // These are static links to thinks like PDFs or other referenced files
    node.url = updateUrl(node.url);
  });
}

function updateLink(url: string) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol.startsWith("http")) return url;
  } catch (error) {
    // pass
  }

  // HACKY FIXME
  return `/static${url}`;
}

export async function transformCDNPage(page: Page): Promise<Page> {
  rewriteStaticLinks(page.mdast, updateLink);
  return page;
}
