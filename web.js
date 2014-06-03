/* -*- Mode: Javascript; indent-tabs-mode:nil; js-indent-level: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/*jslint indent: 2 */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

////////////////////////////////////////////////////////////////////////////////
// Export the public API to Web programs.
////////////////////////////////////////////////////////////////////////////////
window["TeXZilla"] = TeXZilla;
window["TeXZilla"]["setDOMParser"] = TeXZilla.setDOMParser;
window["TeXZilla"]["setXMLSerializer"] = TeXZilla.setXMLSerializer;
window["TeXZilla"]["setSafeMode"] = TeXZilla.setSafeMode;
window["TeXZilla"]["setItexIdentifierMode"] = TeXZilla.setItexIdentifierMode;
window["TeXZilla"]["getTeXSource"] = TeXZilla.getTeXSource;
window["TeXZilla"]["toMathMLString"] = TeXZilla.toMathMLString;
window["TeXZilla"]["toMathML"] = TeXZilla.toMathML;
window["TeXZilla"]["toImage"] = TeXZilla.toImage;
window["TeXZilla"]["filterString"] = TeXZilla.filterString;
window["TeXZilla"]["filterElement"] = TeXZilla.filterElement;
