/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var TeXZilla = require("../TeXZilla");

var isDOMParserSet = true;
try {
    // TeXZilla will automatically try to initialize the DOMParser with a call
    // to new DOMParser(), so in general this is not needed. If you are using
    // Mozilla's XPCOM interface, you can do:
    //
    // TeXZilla.setDOMParser(Components.
    //                    classes["@mozilla.org/xmlextras/domparser;1"].
    //                    createInstance(Components.interfaces.nsIDOMParser));
    //
    // or in Firefox Add-on SDK:
    //
    // var {Cc, Ci} = require("chrome");
    // TeXZilla.setDOMParser(Cc["@mozilla.org/xmlextras/domparser;1"].
    //                       createInstance(Ci.nsIDOMParser));
    //
    TeXZilla.setDOMParser(new DOMParser());
} catch (e) {
    console.log(e);
    isDOMParserSet = false;
}

if (isDOMParserSet) {
    var mathml = TeXZilla.toMathML("a^2 + b^2 = c^2", true);
    console.log("display: " + mathml.getAttribute("display"));
    console.log("source: " + TeXZilla.getTeXSource(mathml));
} else {
    console.log("This commonJS program requires a DOMParser instance!")
}
