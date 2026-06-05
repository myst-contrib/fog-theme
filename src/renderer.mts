import { Environment } from "minijinja-js";

import entrypointTemplate from "./templates/entrypoint.j2.html" with { type: "text" };
import renderersTemplate from "./templates/renderers.j2.html" with { type: "text" };
import pageTemplate from "./templates/page.j2.html" with { type: "text" };

import type { Page } from "./types.mts";

export async function renderPage(content: Page): Promise<string> {
  const env = new Environment();

  env.addTemplate("entrypoint.j2.html", entrypointTemplate);
  env.addTemplate("renderers.j2.html", renderersTemplate);
  env.addTemplate("page.j2.html", pageTemplate);

  return env.renderTemplate("page.j2.html", content);
}
