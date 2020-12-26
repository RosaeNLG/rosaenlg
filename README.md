<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: Apache-2.0
-->
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/4482/badge)](https://bestpractices.coreinfrastructure.org/projects/4482)
[![Known Vulnerabilities](https://snyk.io/test/github/RosaeNLG/rosaenlg/badge.svg)](https://snyk.io/test/github/RosaeNLG/rosaenlg)

_The first RosaeNLG online community meeting will take place Thursday 7th of January 2021, 18:00 to 19:00 UTC+1. Please register on [meetup](https://www.meetup.com/fr-FR/rosaenlg/events/274847667)._

# RosaeNLG

RosaeNLG is a [Natural Language Generation](https://en.wikipedia.org/wiki/Natural-language_generation) library for node.js or client side (browser) execution, based on the [Pug](https://pugjs.org/) template engine.
Based on Pug-like textual templates and on input data, RosaeNLG will generate high quality texts.

Fully supported languages (with grammar, gender etc.) are *English*, *French*, *German*, *Italian* and *Spanish* but you can generate texts in any other language with less features.

RosaeNLG is complete enough to write production grade real life NLG applications.


## Getting Started Using RosaeNLG

**The main documentation site is [rosaenlg.org](https://rosaenlg.org).** A mirror is available on [Github pages](https://rosaenlg.github.io/rosaenlg), but without the search bar. 

Use the Quick Start and the Tutorials on the documentation site.

You can also play around with a client side editor, compiler and renderer with an [in browser editor](https://rosaenlg.org/ide/index.html).

Sample template:
```pug
- var data = ['apples', 'bananas', 'apricots', 'pears'];
p
  eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
    | #{fruit}
`, 'I love apples, bananas, apricots and pears!'
);
```
will generate:
```html
<p>I love apples, bananas, apricots and pears!</p>
```


## Getting Started Developing RosaeNLG

RosaeNLG is an open source project, and welcomes your contribution, be it through code, a bug report, a feature request, or user feedback.

- [The Contribution Guidelines](CONTRIBUTING.md) document will get you started on submitting changes to the project.
- [The Developer Guide](DEVELOPER_GUIDE.md) will walk you through how to set up a development environment, build the code, run tests, add a new language, publish a new version.


## Versioning, Releases

RosaeNLG follows [Semantic Versioning](https://semver.org/).

- a new patch version is published once or twice a month to update third party libraries
- new versions often mix third party library patches, debug, and evolutions
- new versions are published whenever the code is ready (release often mindset)
- new versions are available at the same time as source code on GitHub (on a dedicated version branch), on npm, and on docker hub
- only the last version is maintained (see [Supported Versions](SECURITY.md#supported-versions))


## Join the RosaeNLG Community!

The RosaeNLG community is committed to fostering an open and welcoming environment, with several ways to engage with other users and developers. You can find out more about [here](COMMUNITY.md).

Also check our [Code of Conduct](CODE_OF_CONDUCT.md).


## Roadmap

RosaeNLG aims to become the most used NLG open source engine, and to support more than 50 commonly spoken languages.

Major targets are:

- Improve the ability to add new languages
- Add more languages - depending on contributors
- Add new NLG *libraries*, like `rosaenlg-countries`
- Dedicated VSCode plugin, with template debug support
- Industrialize the Java version


## Logo

*RosaeNLG logo, thanks to Denis Aulas*
![RosaeNLG logo, thanks to Denis Aulas](packages/rosaenlg-doc/doc/modules/advanced/assets/images/rosaenlg-logo-white-bg.png)


## License

RosaeNLG is open source, with most code and documentation available under the Apache 2.0 license (see the [LICENSE](LICENSE)), though some elements are necessarily licensed under different open source licenses for compatibility with upstream licensing or code linking. For instance, `english-ordinals` and `rosaenlg-cli` modules remain under MIT.
