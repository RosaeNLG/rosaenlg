<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# Contributing to RosaeNLG

## Welcomed Contributions

Contributions of any kind are welcomed: code, ideas, etc.

You may start by improving the quality:
- debug
- code quality improvements
- doc improvements

**New languages** require much more work. See [add a new language](DEVELOPER_GUIDE.md#add-a-new-language).

Feel free to author a new NLG library. NLG *libraries* are useful for some kind of projects but should not be added to the core version. See `rosaenlg-countries` for instance (countries common names in various languages).

Contribute to the [Roadmap](README.md#roadmap).


## Contribution Process

Ideation:

- create [an issue on GitHub](https://github.com/RosaeNLG/rosaenlg/issues): bug, idea, etc.
- exchange with the other: what should be done, best approach etc.

Development:

- create a feature branch; name it after the topic: *my-feature* or *issue-#123*
- develop
- write tests: stick to current coverage which is 99-100%
- there must be no warnings in the nominal execution flow
- lint your code following current configuration
- if the code corrects vulnerabilities: CVE IDs must be indicated in the commit message and in the `changelog.adoc`
- each commit **MUST** contain a sign off message (see below)
- new code must be under Apache 2.0 license, new documentation under Creative Commons Attribution 4.0 International, unless specific exceptions (see below)
- update `changelog.adoc` (leave `== [Unreleased]`)
- push your branch
- check that github actions is green
- check [Sonar dashboard](https://sonarcloud.io/dashboard?id=RosaeNLG_rosaenlg), correct everything
- when done, create a PR
- once accepted, code gets merged in master

Publish:
- a new version is built by the core maintainers and integrate the changes in master: see [Versioning, Releases](README.md#versioning-releases)


## Sign off

For compliance purposes, [Developer Certificate of Origin (DCO) on Pull Requests](https://github.com/apps/dco) is activated on the repo.

In practice, you must add a `Signed-off-by:` message at the end of every commit:
```
This is my commit message

Signed-off-by: Random J Developer <random@developer.example.org>
```

Add `-s` flag to add it automatically: `git commit -s -m 'This is my commit message'`.


## License

RosaeNLG is released under Apache 2.0 license.
**New code must be release under Apache 2.0.**

Documentation is under [Creative Commons Attribution 4.0 International](https://spdx.org/licenses/CC-BY-4.0.html).

Exceptions:

- some packages are forks from MIT, and remain under MIT (e.g. `rosae-cli`)
- linguistic resources remain under their original license, but the code using them is Apache 2.0


### For code files

Each file of code **must** contain, in a comment at the top:

- an SPDX short-form identifier
- the copyright (new or updated)

For a new file of code:
```
/**
 * @license
 * Copyright 2020, Random J Developer at Random Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

```

For an existing file, just complete the copyright (put yourself first):
```
/**
 * @license
 * Copyright 2020, Random J Developer at Random Corp., 2019 Ludan Stoecklé, 2018 Other Contributor, etc.
 * SPDX-License-Identifier: Apache-2.0
 */

```

Note that TypeScript code, in addition to an @license tag, **requires an empty line after the initial file comment**.
```TypeScript
/**
 * @license
 * Copyright ...
 * SPDX-License-Identifier: Apache-2.0
 */

// Note the empty line above.
class X { }
```

### For documentation files

Asciidoc `.adoc` files:
```
// Copyright 2021 ...
// SPDX-License-Identifier: CC-BY-4.0
```

Markdown `.md` files:
```
<!--
Copyright 2021 ...
SPDX-License-Identifier: CC-BY-4.0
-->
```
