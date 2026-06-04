# fog-theme

[![PyPI - Version](https://img.shields.io/pypi/v/fog-theme.svg)](https://pypi.org/project/fog-theme)
[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/fog-theme.svg)](https://pypi.org/project/fog-theme)

---

## Table of Contents

- [Installation](#installation)
- [License](#license)

## Installation

```console
pip install fog-theme
```

## License

`fog-theme` is distributed under the terms of the [MIT](https://spdx.org/licenses/MIT.html) license.

## Using the Renderer

```bash
myst build --site
minijinja-cli templates/entrypoint.j2.html _build/site/content/comprehensive.json -a html --trim-blocks --lstrip-blocks
```
