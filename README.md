TeXZilla
========

License
-------

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.

Description
-----------

TeXZilla is a Javascript LaTeX-to-MathML converter compatible
with Unicode. It has performed as the fastest state of the art LaTeX-To-MathML converter according to recent research in this field (see [[1](#references)]). This is still a work in progress and things may change in the
future. Please report any bug you find to the
[issue tracker](https://github.com/fred-wang/TeXZilla/issues?state=open).

For a quick overview, you can try a
[live demo](http://fred-wang.github.io/TeXZilla/), install
[a Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/texzilla/) or
try [a Firefox OS webapp](http://r-gaia-cs.github.io/TeXZilla-webapp/).

You can download a [release archive](https://github.com/fred-wang/TeXZilla/releases) or
install an [npm](https://www.npmjs.org/package/texzilla) package.

Please read the [wiki](https://github.com/fred-wang/TeXZilla/wiki) to get more
information on how to integrate TeXZilla in your Web page or project as well
as a description of the TeXZilla syntax. See also the examples/ directory.

Build Instructions
------------------

The following dependencies are required:

- [coreutils](https://www.gnu.org/software/coreutils/), [sed](https://www.gnu.org/software/sed/), [curl](http://curl.haxx.se/), [make](https://www.gnu.org/software/make/), procps, grep
- [xsltproc](http://xmlsoft.org/XSLT/xsltproc2.html)
- [Python](http://www.python.org/)
- [Jison](http://zaach.github.io/jison).
- To run unit tests: [slimerJS](http://slimerjs.org/) or [phantomJS](http://phantomjs.org/), [bash](https://www.gnu.org/software/bash/). [nodejs](http://nodejs.org/) can be used to run the DOM-less tests.
- To generate the minified version `TeXZilla-min.js`: [Google Closure Compiler](https://developers.google.com/closure/compiler/).

On Debian-based Linux distributions, try `sudo apt-get install coreutils sed curl make xsltproc python npm phantomjs bash closure-compiler` and install Jison with `npm install jison -g`.

To build TeXZilla, run the tests and generate the minified version:

      ./configure
      make all
      make minify

Type `make help` for more commands.


References
------------------
[1] _"Improving the Representation and Conversion of Mathematical Formulae by Considering their Textual Context"_ by M. Schubotz, et al. In: _Proceedings of the ACM/IEEE-CS Joint Conference on Digital Libraries (JCDL)_. Fort Worth, USA, June 2018. [DOI:10.1145/3197026.3197058](dx.doi.org/10.1145/3197026.3197058)
