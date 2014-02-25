/* -*- Mode: Javascript; indent-tabs-mode:nil; js-indent-level: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/*jslint indent: 2 */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if (typeof require !== "undefined") {

  // FIXME: This tries to work with slimerjs, phantomjs and nodejs. Ideally,
  // we should have a standard commonJS interface.
  // https://github.com/fred-wang/TeXZilla/issues/6

  var exitCommonJS = function (aStatus) {
    if (typeof process !== "undefined") {
      process.exit(aStatus);
    } else if (typeof slimer !== "undefined") {
      slimer.exit(aStatus);
    } else if (typeof phantom !== "undefined") {
      phantom.exit(aStatus);
    }
  };

  var usage = function () {
    // Display the usage information.
    console.log("\nUsage:\n");
    console.log("commonjs TeXZilla.js [help]");
    console.log("  Print this help message.\n");
    console.log("commonjs TeXZilla.js parser aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]");
    console.log("  Print TeXZilla.toMathMLString(aTeX, aDisplay, aRTL, aThrowExceptionOnError)");
    console.log("  The interpretation of arguments and the default values are the same.\n");
    console.log("commonjs TeXZilla.js webserver [port]");
    console.log("  Start a Web server on the specified port (default:3141)");
    console.log("  See the TeXZilla wiki for details.\n");
    console.log("cat input | commonjs TeXZilla.js streamfilter > output");
    console.log("  TODO\n");
    console.log("  where commonjs is slimerjs, nodejs or phantomjs.");
  };

  var setParamValue = function (aParam, aKey, aString) {
    // Set the param value from the string value.
    if (aKey === "tex") {
      aParam[aKey] = aString;
    } else if (aKey === "display" || aKey === "rtl" || aKey === "exception") {
      aParam[aKey] = (aString === "true");
    }
  };

  var getMathMLString = function (aParam) {
    // Call the TeXZilla parser with the specified parameters and
    // return the MathML output.
    return TeXZilla.toMathMLString(aParam.tex, aParam.display,
                                   aParam.rtl, aParam.exception);
  };

  var getParametersFromURL = function (aURL) {
    // Get the param values from the GET URL.
    var param, query, vars, i, pair, key, value;
    param = {};
    query = aURL.split("?")[1];
    if (query) {
      vars = query.split("&");
      for (i = 0; i < vars.length; i++) {
        pair = vars[i].split("=");
        key = decodeURIComponent(pair[0]).toLowerCase();
        value = decodeURIComponent(pair[1]);
        setParamValue(param, key, value);
      }
    }
    return param;
  };

  var getParametersFromPOSTData = function (aPOSTData) {
    // Get the param values from the POST JSON data.
    var param = {}, json = JSON.parse(aPOSTData), key;
    for (key in json) {
      setParamValue(param, key, json[key]);
    }
    return param;
  };

  var getServerResponseFromParam = function (aParam) {
    // Get the JSON data to send back.
    var data = { tex: aParam.tex };
    try {
      data.mathml = getMathMLString(aParam);
      data.exception = null;
    } catch (e) {
      data.exception = e.message;
    }
    return JSON.stringify(data);
  };

  var webserverListener = function (aRequest, aResponse) {
    // Listener for the "webserver" module (phantomjs, slimerjs).
    var param = {}, json = {}, response;
    if (aRequest.method === "GET") {
      param = getParametersFromURL(aRequest.url);
    } else if (aRequest.method === "POST") {
      param = getParametersFromPOSTData(aRequest.post);
    }
    if (param.tex !== undefined) {
      json = getServerResponseFromParam(param);
    }
    response = JSON.stringify(json);
    aResponse.statusCode = 200;
    aResponse.setHeader("Content-Type", "application/json");
    aResponse.write(response);
    aResponse.close();
  };

  var httpListener = function (aRequest, aResponse) {
    // Listener for the "http" module (nodejs).
    var param = {}, json = {}, response, body = "";
    aRequest.setEncoding("utf8");
    aRequest.on("data", function (aChunk) {
      body += aChunk;
    });
    aRequest.on("end", function () {
      aResponse.writeHead(200, {"Content-Type": ""});
      if (aRequest.method === "GET") {
        param = getParametersFromURL(aRequest.url);
      } else if (aRequest.method === "POST") {
        param = getParametersFromPOSTData(body);
      }
      if (param.tex !== undefined) {
        json = getServerResponseFromParam(param);
      }
      response = JSON.stringify(json);
      aResponse.writeHead(200, { "Content-Type": "application/json" });
      aResponse.write(response);
      aResponse.end();
    });
  };
  
  var startWebServer = function (aPort)
  {
    try {
      require("webserver").create().listen(aPort, webserverListener);
    } catch (e) {
      require("http").createServer(httpListener).listen(aPort);
    }
    console.log("Web server started on http://localhost:" + aPort);
  }

  var main = function (aArgs) {
    // Main command line function.
    var param = {};
    if (aArgs.length >= 3 && aArgs[1] === "parser") {
      // Parse the string and print the output.
      setParamValue(param, "tex", aArgs[2]);
      setParamValue(param, "display", aArgs[3]);
      setParamValue(param, "rtl", aArgs[4]);
      setParamValue(param, "exception", aArgs[5]);
      try {
        console.log(getMathMLString(param));
        exitCommonJS(0);
      } catch (e) {
        console.log(e);
        exitCommonJS(1);
      }
    } else if (aArgs.length >= 2 && aArgs[1] === "webserver") {
      // Run a Web server.
      try {
        startWebServer(aArgs.length >= 3 ? parseInt(aArgs[2], 10) : 3141);
      } catch (e) {
        console.log(e);
        exitCommonJS(1);
      }
    } else {
      // FIXME: add a stream filter.
      // https://github.com/fred-wang/TeXZilla/issues/7
      usage();
      exitCommonJS(0);
    }
  };

  if (typeof exports !== "undefined") {
    // Export the public API.
    exports.setDOMParser = function (aDOMParser) {
      TeXZilla.DOMParser = aDOMParser;
    };

    exports.getTeXSource = function () {
      return TeXZilla.getTeXSource.apply(TeXZilla, arguments);
    };

    exports.toMathMLString = function () {
      return TeXZilla.toMathMLString.apply(TeXZilla, arguments);
    };

    exports.toMathML = function () {
      return TeXZilla.toMathML.apply(TeXZilla, arguments);
    };

    exports.main = main;
  }

  if (typeof exports === "undefined" ||
      (typeof module !== "undefined" && require.main === module)) {
    // Process the command line arguments and execute the main program.
    var args;
    if (typeof process !== "undefined") {
      args = process.argv.slice(1);
    } else {
      args = require("system").args;
    }
    main(args);
  }
}
