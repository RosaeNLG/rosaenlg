<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# Security Policy

## Supported Versions

The latest version is the only supported.
When a security issue is found, it is corrected and a new patch version is published. The patch is only applied on the latest version.

[Addventa](https://www.addventa.com/), a company specialized in NLG and based in Paris provides commercial support on RosaeNLG, and can support defined versions in the long term.


## Tooling

- Most detected security issues come from third party libraries used in RosaeNLG. These libraries are followed up using [Snyk](https://snyk.io/).
- Sonar detects issues in RosaeNLG code itself, see [public Sonar dashboard](https://sonarcloud.io/dashboard?id=RosaeNLG_rosaenlg).


## Reporting a Vulnerability

Security issues should be reported through [GitHub issue tracker](https://github.com/RosaeNLG/rosaenlg/issues). Use the "security" label.

Vulnerabilities that must remain private can be reported directly to the author: contact [at] rosaenlg [dot] org

Resolution timeframe depends on the severity and the complexity of the issue.
Usually, a new version containing third party dependencies fixes is published at least every month.

Also, feel free to submit PR correcting security issues.


## Security Profile

### RosaeNLG library

RosaeNLG is a library that works in 2 steps:
1. The Pug/RosaeNLG templates are transformed into JavaScript. You can see this step as a compilation.
1. The JavaScript is then run. In this second step, RosaeNLG only provides functions in the environment so that the code gets run properly.

It is impossible to do a "require" in a template, which means that `fs` (filesystem) or `https` (network) are not accessible.
Yet, any JavaScript code can be generated from templates. Actually, it is possible, and very common, to have JavaScript code snippets directly embedded in the templates.

Both templates (which are code) and the resulting JavaScript (which is code) should not be trusted blindly. Good practices include that:
- Templates should be versioned (e.g in a Git repo)
- They should be reviewed before going to production
- The transformation in JavaScript (using RosaeNLG) should be done in the CI

### Node JS server

While being a library, an API based on a node.js web server is also provided. The same library is bundled in a Docker image.
JWT authentication can be activated on that server.
Yet, there has been no security review around this component, and it should not be considered as secured nor hardened.

### Java version

The Java version of RosaeNLG uses GraalVM, which is a sandboxed environment within the JVM.
This brings an extra level of security.

