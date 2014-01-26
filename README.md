TeXZilla
========

License
-------

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.

Description
-----------

TeXZilla is a Javascript TeX-to-MathML converter compatible
with Unicode. This is still a work in progress and things may change in the
future. See https://github.com/fred-wang/TeXZilla/issues for known issues.
See https://github.com/fred-wang/TeXZilla/releases for archives.

You can use TeXZilla in a commonJS program:

      var TeXZilla = require("./TeXZilla");
      console.log(TeXZilla.toMathMLString("\\sqrt{\\frac{x}{2}+y}"));

or from a Web page:

      <script type="text/javascript" src="TeXZilla-min.js"></script>
      ...
      var MathMLElement = TeXZilla.toMathML("\\sqrt{\\frac{x}{2}+y}");

See also http://fred-wang.github.io/TeXZilla/ for a live demo.

The public API is:

      TeXZilla.toMathMLString = function(aTeX, aDisplay, aRTL)

  converts the TeX string aTeX into a MathML source. The optional boolean
  aDisplay and aRTL indicates whether the MathML output should be in display
  mode and in RTL direction respectively.

      TeXZilla.toMathML = function(aTeX, aDisplay, aRTL)

  is the same as TeXZilla.toMathMLString, but returns a MathML DOM element. This
  requires to have a DOMParser API available (see TeXZilla.setDOMParser below).

      TeXZilla.getTeXSource = function(aMathMLElement)

  returns the TeX source attached to aMathMLElement via a semantics annotation
  or null if none is found. aMathMLElement is either a string or a MathML DOM
  element. This requires to have a DOMParser API available (see
  TeXZilla.setDOMParser below).

      TeXZilla.setDOMParser = function(aDOMParser)

  sets TeXZilla's DOMParser to the DOMParser instance aDOMParser. TeXZilla
  tries to automatically initialized its DOMParser to `new DOMParser()`.
  Otherwise it remains null and you must use TeXZilla.setDOMParser to set it
  yourself. For example using Mozilla's XPCOM interface:

      TeXZilla.setDOMParser(Components.
                            classes["@mozilla.org/xmlextras/domparser;1"].
                            createInstance(Components.interfaces.nsIDOMParser));

  or for Firefox Add-on SDK:

      var {Cc, Ci} = require("chrome");
      TeXZilla.setDOMParser(Cc["@mozilla.org/xmlextras/domparser;1"].
                            createInstance(Ci.nsIDOMParser));

Dependencies
------------

Required to generate `TeXZilla.js`:

- [coreutils](https://www.gnu.org/software/coreutils/), [sed](https://www.gnu.org/software/sed/), [wget](https://www.gnu.org/software/wget/), [make](https://www.gnu.org/software/make/)
- [xsltproc](http://xmlsoft.org/XSLT/xsltproc2.html)
- [Python](http://www.python.org/)
- [Jison](http://zaach.github.io/jison) and NodeJS.

Optional:

- To run unit tests: [slimerJS](http://slimerjs.org/)
- To generate the minified version `TeXZilla-min.js`: [Google Closure Compiler](https://developers.google.com/closure/compiler/) and Java.

Compiling
---------

Update config.cfg and try "make help".
