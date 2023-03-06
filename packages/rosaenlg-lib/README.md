<!--
Copyright 2023 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->

# RosaeNLG - library version

RosaeNLG is a Natural Language Generation library.
It is available:
- as a template engine, based on Pug: it is the most usual usage, see `rosaenlg` package
- as a code library (code API), to be used programmatically in JavaScript/TypeScript projects, without any templates: this is the `rosaenlg-lib` package

Writing plain code (without templating) to generate plain text is painful so most usages please consider using `rosaenlg` directly, and **not this `rosaenlg-lib` package**.

Documentation is automatically published here: https://rosaenlg.org - especially the rosaenlg-no-pug page.

## License

Apache 2.0

## Dev notes

- `rosaenlg` -> `rosaenlg-lib`
- but `rosaenlg-lib` tests do use `rosaenlg/lib/index`
- thus `test:before` runs a gulp script in `rosaenlg` package

