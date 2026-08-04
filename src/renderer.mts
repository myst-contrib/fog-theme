import { Environment } from "minijinja-js";

import entrypointTemplate from "./templates/entrypoint.j2.html" with { type: "text" };
import renderersTemplate from "./templates/renderers.j2.html" with { type: "text" };
import pageTemplate from "./templates/page.j2.html" with { type: "text" };

import type { Page } from "./types.mts";

/**
 * Convert an abs path into a page-relative path
 *
 * @param path absolute path to resolve
 * @param components path comonents to current page
 */
function makeAbsolutePath(path: string, components: string[]) {
  const tail = path.startsWith("/") ? path.slice(1) : path;
  return [...components.map(() => "../"), tail].join("");
}

export async function renderPage(
  content: Page,
  components: string[],
): Promise<string> {
  const env = new Environment();
  env.enablePyCompat();

  env.addTemplate("entrypoint.j2.html", entrypointTemplate);
  env.addTemplate("renderers.j2.html", renderersTemplate);
  env.addTemplate("page.j2.html", pageTemplate);

  env.addFilter("make_relative", (path: string) =>
    makeAbsolutePath(path, components),
  );

  return env.renderTemplate("page.j2.html", content);
}
