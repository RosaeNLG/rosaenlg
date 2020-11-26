<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: Apache-2.0
-->
# Security Policy

## Supported Versions

The latest version is the only supported.
When a security issue is found, it is corrected and a new patch version is published. The patch is only applied on the latest version.

[Addventa](https://www.addventa.com/), a company specialized in NLG and based in Paris provides commercial support on RosaeNLG, and can support defined versions in the long term.


## Tooling

- Most detected security issues come from third party libraries used in RosaeNLG. These libraries are followed up using [Snyk](https://snyk.io/).
- Sonar detects issues in RosaeNLG code itself, see [public Sonar dashboard](https://sonarcloud.io/dashboard?id=RosaeNLG_RosaeNLG).


## Reporting a Vulnerability

Security issues should be reported through [GitHub issue tracker](https://github.com/RosaeNLG/rosaenlg/issues). Use the "security" label.

Resolution timeframe depends on the severity and the complexity of the issue.
Usually, a new version containing third party dependencies fixes is published at least every month.

Also, feel free to submit PR correcting security issues.
