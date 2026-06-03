# fog-theme
A prototype for a MyST Theme built from Python and Jinja templates

```bash
myst build --site
minijinja-cli templates/entrypoint.j2.html _build/site/content/comprehensive.json -a html --trim-blocks --lstrip-blocks
```
