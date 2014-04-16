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
with Unicode. This is still a work in progress and things may change in the
future. Please report any bug you find to the
[issue tracker](https://github.com/fred-wang/TeXZilla/issues?state=open).

For a quick overview, you can try a
[live demo](http://fred-wang.github.io/TeXZilla/), install
[a Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/texzilla/),
try [a Firefox OS webapp](http://r-gaia-cs.github.io/TeXZilla-webapp/),
check this page with [custom &lt;x-tex&gt; tag](http://fred-wang.github.io/x-tex/demo/).

You can download a [release archive](https://github.com/fred-wang/TeXZilla/releases) or
install an [npm](https://www.npmjs.org/package/texzilla) package.

Please read the [wiki](https://github.com/fred-wang/TeXZilla/wiki) to get more
information on how to integrate TeXZilla in your Web page or project as well
as a description of the TeXZilla syntax. See also the examples/ directory.

Build Instructions
------------------

The following are required to generate `TeXZilla.js`:

- [coreutils](https://www.gnu.org/software/coreutils/), [sed](https://www.gnu.org/software/sed/), [wget](https://www.gnu.org/software/wget/), [make](https://www.gnu.org/software/make/)
- [xsltproc](http://xmlsoft.org/XSLT/xsltproc2.html)
- [Python](http://www.python.org/)
- [Jison](http://zaach.github.io/jison) and NodeJS.

These dependencies are optional:

- To run unit tests: [slimerJS](http://slimerjs.org/) or [phantomJS](http://phantomjs.org/)
- To generate the minified version `TeXZilla-min.js`: [Google Closure Compiler](https://developers.google.com/closure/compiler/) and Java.

To build TeXZilla, update config.cfg and try "make help".
