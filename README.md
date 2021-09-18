<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->

![RosaeNLG logo, thanks to Denis Aulas](packages/rosaenlg-doc/doc/modules/advanced/assets/images/rosaenlg-logo-white-bg.png)

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/4482/badge)](https://bestpractices.coreinfrastructure.org/projects/4482)
[![Known Vulnerabilities](https://snyk.io/test/github/RosaeNLG/rosaenlg/badge.svg)](https://snyk.io/test/github/RosaeNLG/rosaenlg)

# RosaeNLG

RosaeNLG is a [Natural Language Generation](https://en.wikipedia.org/wiki/Natural-language_generation) library for node.js or client side (browser) execution, based on the [Pug](https://pugjs.org/) template engine.
Based on Pug-like textual templates and on input data, RosaeNLG will generate high quality texts.

Fully supported languages (with grammar, gender etc.) are *English*, *French*, *German*, *Italian* and *Spanish* but you can generate texts in any other language with less features.

RosaeNLG is complete enough to write production grade real life NLG applications.

RosaeNLG is a Sandbox Project of [LF AI & Data Foundation](https://lfaidata.foundation/), part of the Linux Foundation.

<img src="https://artwork.lfaidata.foundation/lfaidata-assets/lfaidata-project-badge/sandbox/color/lfaidata-project-badge-sandbox-color.svg" width="300">



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

See [Release doc](RELEASE.md)


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
- Industrialize the [Java version](https://github.com/RosaeNLG/rosaenlg-java)

2021 Roadmap was presented and discussed during the first 2021 RosaeNLG meetup. See [detailed 2021 roadmap](https://rosaenlg.org/meetup/meetup_rosaenlg_1.html#_roadmap).


## Logo & Artwork

RosaeNLG logo was made by Denis Aulas.
Reference artwork is [here](https://github.com/RosaeNLG/artwork).


## License

RosaeNLG is open source, with most code available under the Apache 2.0 license (see the [LICENSE](LICENSE)), and documentation under Creative Commons Attribution 4.0 International (CC-BY-4.0) license, though some elements are necessarily licensed under different open source licenses for compatibility with upstream licensing or code linking. For instance, `english-ordinals` and `rosaenlg-cli` modules remain under MIT.

The licenses applicable to each linguistic resource package are included in each subfolder the `package` directory, and a summary of the licenses can be found in the [Linguistic resources documentation](./packages/rosaenlg-doc/doc/modules/advanced/pages/resources.adoc).
