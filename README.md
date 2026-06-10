# Fog theme

The [MyST Book Theme](https://github.com/jupyter-book/myst-theme.git) is a web application built on top of Remix, TypeScript, React, and Tailwind. The use of modern web frameworks makes it easy to build stateful and powerful web applications. The downside of this approach is that it requires an understanding of several complex frameworks, and doesn't lean in to the kinds of SSR skills that many developers are familiar with.

This theme exists as an intentional counterpart to MyST Theme. It's designed with the following explicit choices in mind:

1. Site layout should be handled via Jinja templates, that users can bring.
2. Components should be styled by global stylesheets, not inline CSS.

Although I had hopes to build this theme as a Python application, the difficulty in robustly sharing code between the renderer and the browser (e.g. when rendering hover previews) led to a rebuild of this theme in TypeScript. I hope that the theme itself will be fairly lightweight, justifying this trade-off from the original design vision.

## Table of Contents

- [Installation](#installation)
- [License](#license)

## Installation

```console
pnpm install
```

## License

`fog-theme` is distributed under the terms of the [MIT](https://spdx.org/licenses/MIT.html) license.

## Using the Renderer

Start MyST server in content
```bash
env -C content myst start --headless
```

Run the theme server
```bash
pnpm run start
```
