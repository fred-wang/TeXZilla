/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if (typeof require !== "undefined" && typeof exports !== "undefined") {

  exports.setDOMParser = function (aDOMParser) {
    TeXZilla.DOMParser = aDOMParser;
  }

  exports.getTeXSource = function () {
    return TeXZilla.getTeXSource.apply(TeXZilla, arguments);
  };

  exports.toMathMLString = function () {
    return TeXZilla.toMathMLString.apply(TeXZilla, arguments);
  };

  exports.toMathML = function () {
    return TeXZilla.toMathML.apply(TeXZilla, arguments);
  };

  /* FIXME: add some commonJS command line API.
     https://github.com/fred-wang/TeXZilla/issues/7 */
}
