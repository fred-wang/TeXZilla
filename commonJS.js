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

  /* Command line API */
  var system = require("system");
  var args = system.args;

  function usage(aName) {
    console.log("\nUsage:\n");
    console.log("slimerjs " + aName + " [help]");
    console.log("  Print this help message.\n");
    console.log("slimerjs " + aName + " parser aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]");
    console.log("  Print TeXZilla.toMathMLString(aTeX, aDisplay, aRTL, aThrowExceptionOnError)");
    console.log("  The interpretation of arguments and the default values are the same.\n");
    console.log("slimerjs " + aName + " webserver [port]");
    console.log("  TODO\n");
    console.log("cat input | slimerjs " + aName + " stream > output");
    console.log("  TODO\n");
  }

  if (args.length >= 3 && args[1] === "parser") {
    var tex = args[2];
    var display = (args.length >= 4 ? args[3] === "true" : false);
    var RTL = (args.length >= 5 ? args[4] === "true" : false);
    var throwException = (args.length >= 6 ? args[5] === "true" : false);
    try {
      console.log(TeXZilla.toMathMLString(tex, display, RTL, throwException));
    } catch(e) {
      /* FIXME: This should probably call exit with status 1.
         https://github.com/fred-wang/TeXZilla/issues/6 */
      console.log(e);
    }
  } else {
    /* FIXME: add a stream filter and web server
       https://github.com/fred-wang/TeXZilla/issues/7 */
    usage(args[0]);
  }

  /* FIXME: We should use a standard commoneJS syntax for exit.
     https://github.com/fred-wang/TeXZilla/issues/6 */
  if (slimer) {
    slimer.exit()
  } else if (phantom) {
    phantom.exit()
  }
}
