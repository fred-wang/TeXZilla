/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

%{
var MathMLNameSpace = "http://www.w3.org/1998/Math/MathML",
    SVGNameSpace = "http://www.w3.org/2000/svg",
    TeXMimeTypes = ["TeX", "LaTeX", "text/x-tex", "text/x-latex",
                    "application/x-tex", "application/x-latex"];

function escapeText(aString) {
  /* Escape reserved XML characters for use as text nodes. */
  return aString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeQuote(aString) {
  /* Escape the double quote characters for use as attribute. */
  return aString.replace(/"/g, "&#x22;");
}

function namedSpaceToEm(aString) {
  var index = [
    "negativeveryverythinmathspace",
    "negativeverythinmathspace",
    "negativemediummathspace",
    "negativethickmathspace",
    "negativeverythickmathspace",
    "negativeveryverythickmathspace",
    "",
    "veryverythinmathspace",
    "verythinmathspace",
    "thinmathspace",
    "mediummathspace",
    "thickmathspace",
    "verythickmathspace",
    "veryverythickmathspace"
  ].indexOf(aString);
  return (index === -1 ? 0 : index - 6) / 18.0;
}

function parseLength(aString) {
  /* See http://www.w3.org/TR/MathML3/appendixa.html#parsing_length */
  aString = aString.trim();
  var lengthRegexp = /(-?[0-9]*(?:[0-9]\.?|\.[0-9])[0-9]*)(e[mx]|in|cm|mm|p[xtc]|%)?/, result = lengthRegexp.exec(aString);
  if (result) {
    result[1] = parseFloat(result[1]);
    if (!result[2]) {
      /* Unitless values are treated as a percent */
      result[1] *= 100;
      result[2] = "%";
    }
    return { l: result[1], u: result[2] };
  }
  return { l: namedSpaceToEm(aString), u: "em" };
}

function serializeTree(aTree) {
  var output = "<" + aTree["tag"];
  for (var name in aTree["attributes"]) {
    if (aTree["attributes"][name] !== undefined)
      output += " " + name + "=\"" + aTree["attributes"][name] + "\"";
  }
  if (aTree["content"]) {
    output += ">";
    if (Array.isArray(aTree["content"])) {
      aTree["content"].forEach(function(child) {
        output += serializeTree(child);
      });
    } else
      output += aTree["content"];
    output += "</" + aTree["tag"] + ">";
  } else {
    output += "/>";
  }
  return output;
}

function newTag(aTag, aChildren, aAttributes) {
  return {
    "tag": aTag,
    "content": aChildren,
    "attributes": aAttributes
  };
}

function isEmptyMrow(aTree) {
  return aTree["tag"] === "mrow" && !aTree["content"] && !aTree["attributes"];
}

function newMo(aContent, aLeftSpace, aRightSpace) {
  return newTag("mo", escapeText(aContent), {
     "lspace": aLeftSpace !== undefined ? aLeftSpace + "em" : undefined,
     "rspace": aRightSpace !== undefined ? aRightSpace + "em" : undefined
  });
}

function newSpace(aWidth) {
   return newTag("mspace", null, {"width": aWidth + "em"});
}

function isToken(aTree) {
  return ["mi", "mn", "mo", "mtext", "ms"].indexOf(aTree["tag"]) !== -1;
}

function isSingleCharMi(aTree) {
  if (aTree["tag"] !== "mi")
    return false;
  var content = aTree["content"];
  var c = content["codePointAt"](0);
  return content.length === 1 && c <= 0xFFFF ||
         content.length === 2 && c > 0xFFFF;
}

function areTokenAttributes(aAttributes) {
  for (var attribute in aAttributes) {
    if (["mathcolor", "mathbackground", "mathvariant"].indexOf(attribute) === -1)
      return false;
  }
  return true;
}

function applyMathVariantToCharacter(codePoint, aMathVariant) {
  // FIXME: We should have LaTeX commmands for all these variants.
  // See https://github.com/fred-wang/TeXZilla/issues/64
  var mathvariant = [
    "bold",
    "italic",
    "bold-italic",
    "script",
    "bold-script",
    "fraktur",
    "double-struck",
    "bold-fraktur",
    "sans-serif",
    "bold-sans-serif",
    "sans-serif-italic",
    "sans-serif-bold-italic",
    "monospace",
    "initial",
    "tailed",
    "looped",
    "stretched"
  ].indexOf(aMathVariant);
  var Bold = 0;
  var Italic = 1;
  var BoldItalic = 2;
  var Script = 3;
  var BoldScript = 4;
  var Fraktur = 5;
  var DoubleStruck = 6;
  var BoldFraktur = 7;
  var SansSerif = 8;
  var BoldSansSerif = 9;
  var SansSerifItalic = 10;
  var SansSerifBoldItalic = 11;
  var Monospace = 12;
  var Initial = 13;
  var Tailed = 14;
  var Looped = 15;
  var Stretched = 16;

  var greekUpperTheta = 0x03F4;
  var holeGreekUpperTheta = 0x03A2;
  var nabla = 0x2207;
  var partialDifferential = 0x2202;
  var greekUpperAlpha = 0x0391;
  var greekUpperOmega = 0x03A9;
  var greekLowerAlpha = 0x03B1;
  var greekLowerOmega = 0x03C9;
  var greekLunateEpsilonSymbol = 0x03F5;
  var greekThetaSymbol = 0x03D1;
  var greekKappaSymbol = 0x03F0;
  var greekPhiSymbol = 0x03D5;
  var greekRhoSymbol = 0x03F1;
  var greekPiSymbol = 0x03D6;
  var greekLetterDigamma = 0x03DC;
  var greekSmallLetterDigamma = 0x03DD;
  var mathBoldCapitalDigamma = 0x1D7CA;
  var mathBoldSmallDigamma = 0x1D7CB;

  var latinSmallLetterDotlessI = 0x0131;
  var latinSmallLetterDotlessJ = 0x0237;

  var mathItalicSmallDotlessI = 0x1D6A4;
  var mathItalicSmallDotlessJ = 0x1D6A5;

  var digit0 = 0x30;
  var digit9 = 0x39;
  var upperA = 0x41;
  var upperZ = 0x5A;
  var smallA = 0x61;
  var smallZ = 0x7A;

  var mathBoldUpperA = 0x1D400;
  var mathItalicUpperA = 0x1D434;
  var mathBoldSmallA = 0x1D41A;
  var mathBoldUpperAlpha = 0x1D6A8;
  var mathBoldSmallAlpha = 0x1D6C2;
  var mathItalicUpperAlpha = 0x1D6E2;
  var mathBoldDigitZero = 0x1D7CE;
  var mathDoubleStruckZero = 0x1D7D8;

  var mathBoldUpperTheta = 0x1D6B9;
  var mathBoldNabla = 0x1D6C1;
  var mathBoldPartialDifferential = 0x1D6DB;
  var mathBoldEpsilonSymbol = 0x1D6DC;
  var mathBoldThetaSymbol = 0x1D6DD;
  var mathBoldKappaSymbol = 0x1D6DE;
  var mathBoldPhiSymbol = 0x1D6DF;
  var mathBoldRhoSymbol = 0x1D6E0;
  var mathBoldPiSymbol = 0x1D6E1;

  /* Exceptional characters with at most one possible transformation. */
  if (codePoint == holeGreekUpperTheta)
    return codePoint;
  if (codePoint == greekLetterDigamma) {
    if (mathvariant == Bold)
      return mathBoldCapitalDigamma;
    return codePoint;
  }
  if (codePoint == greekSmallLetterDigamma) {
    if (mathvariant == Bold)
      return mathBoldSmallDigamma;
    return codePoint;
  }
  if (codePoint == latinSmallLetterDotlessI) {
    if (mathvariant == Italic)
      return mathItalicSmallDotlessI;
    return codePoint;
  }
  if (codePoint == latinSmallLetterDotlessJ) {
    if (mathvariant == Italic)
      return mathItalicSmallDotlessJ;
    return codePoint;
  }

  var baseChar, multiplier, map;

  /* Latin */
  if (upperA <= codePoint && codePoint <= upperZ ||
      smallA <= codePoint && codePoint <= smallZ) {
    baseChar = codePoint <= upperZ ? codePoint - upperA :
               mathBoldSmallA - mathBoldUpperA + codePoint - smallA;
    multiplier = mathvariant;
    if (mathvariant > Monospace)
      return codePoint; // Latin doesn't support the Arabic mathvariants
    var transformedChar = baseChar + mathBoldUpperA +
                          multiplier * (mathItalicUpperA - mathBoldUpperA);
    map = {
      0x1D455: 0x210E,
      0x1D49D: 0x212C,
      0x1D4A0: 0x2130,
      0x1D4A1: 0x2131,
      0x1D4A3: 0x210B,
      0x1D4A4: 0x2110,
      0x1D4A7: 0x2112,
      0x1D4A8: 0x2133,
      0x1D4AD: 0x211B,
      0x1D4BA: 0x212F,
      0x1D4BC: 0x210A,
      0x1D4C4: 0x2134,
      0x1D506: 0x212D,
      0x1D50B: 0x210C,
      0x1D50C: 0x2111,
      0x1D515: 0x211C,
      0x1D51D: 0x2128,
      0x1D53A: 0x2102,
      0x1D53F: 0x210D,
      0x1D545: 0x2115,
      0x1D547: 0x2119,
      0x1D548: 0x211A,
      0x1D549: 0x211D,
      0x1D551: 0x2124
    };
    return map[transformedChar] ? map[transformedChar] : transformedChar;
  }

  /* Digits */
  if (digit0 <= codePoint && codePoint <= digit9) {
    baseChar = codePoint - digit0;
    switch (mathvariant) {
      case Bold:
        multiplier = 0;
        break;
      case DoubleStruck:
        multiplier = 1;
        break;
      case SansSerif:
        multiplier = 2;
        break;
      case BoldSansSerif:
        multiplier = 3;
        break;
      case Monospace:
        multiplier = 4;
        break;
      default:
        return codePoint;
    }
    return baseChar + multiplier * (mathDoubleStruckZero - mathBoldDigitZero) +
           mathBoldDigitZero;
  }

  // Arabic characters are defined within this range
  if (0x0600 <= codePoint && codePoint <= 0x06FF) {
    // The Arabic mathematical block is not continuous, nor does it have a
    // monotonic mapping to the unencoded characters, requiring the use of a
    // lookup table.
    switch (mathvariant) {
      case Initial:
        map = {
          0x628: 0x1EE21,
          0x62A: 0x1EE35,
          0x62B: 0x1EE36,
          0x62C: 0x1EE22,
          0x62D: 0x1EE27,
          0x62E: 0x1EE37,
          0x633: 0x1EE2E,
          0x634: 0x1EE34,
          0x635: 0x1EE31,
          0x636: 0x1EE39,
          0x639: 0x1EE2F,
          0x63A: 0x1EE3B,
          0x641: 0x1EE30,
          0x642: 0x1EE32,
          0x643: 0x1EE2A,
          0x644: 0x1EE2B,
          0x645: 0x1EE2C,
          0x646: 0x1EE2D,
          0x647: 0x1EE24,
          0x64A: 0x1EE29
        };
      break;
      case Tailed:
        map = {
          0x62C: 0x1EE42,
          0x62D: 0x1EE47,
          0x62E: 0x1EE57,
          0x633: 0x1EE4E,
          0x634: 0x1EE54,
          0x635: 0x1EE51,
          0x636: 0x1EE59,
          0x639: 0x1EE4F,
          0x63A: 0x1EE5B,
          0x642: 0x1EE52,
          0x644: 0x1EE4B,
          0x646: 0x1EE4D,
          0x64A: 0x1EE49,
          0x66F: 0x1EE5F,
          0x6BA: 0x1EE5D
        };
      break;
      case Stretched:
        map = {
          0x628: 0x1EE61,
          0x62A: 0x1EE75,
          0x62B: 0x1EE76,
          0x62C: 0x1EE62,
          0x62D: 0x1EE67,
          0x62E: 0x1EE77,
          0x633: 0x1EE6E,
          0x634: 0x1EE74,
          0x635: 0x1EE71,
          0x636: 0x1EE79,
          0x637: 0x1EE68,
          0x638: 0x1EE7A,
          0x639: 0x1EE6F,
          0x63A: 0x1EE7B,
          0x641: 0x1EE70,
          0x642: 0x1EE72,
          0x643: 0x1EE6A,
          0x645: 0x1EE6C,
          0x646: 0x1EE6D,
          0x647: 0x1EE64,
          0x64A: 0x1EE69,
          0x66E: 0x1EE7C,
          0x6A1: 0x1EE7E
        };
      break;
      case Looped:
        map = {
          0x627: 0x1EE80,
          0x628: 0x1EE81,
          0x62A: 0x1EE95,
          0x62B: 0x1EE96,
          0x62C: 0x1EE82,
          0x62D: 0x1EE87,
          0x62E: 0x1EE97,
          0x62F: 0x1EE83,
          0x630: 0x1EE98,
          0x631: 0x1EE93,
          0x632: 0x1EE86,
          0x633: 0x1EE8E,
          0x634: 0x1EE94,
          0x635: 0x1EE91,
          0x636: 0x1EE99,
          0x637: 0x1EE88,
          0x638: 0x1EE9A,
          0x639: 0x1EE8F,
          0x63A: 0x1EE9B,
          0x641: 0x1EE90,
          0x642: 0x1EE92,
          0x644: 0x1EE8B,
          0x645: 0x1EE8C,
          0x646: 0x1EE8D,
          0x647: 0x1EE84,
          0x648: 0x1EE85,
          0x64A: 0x1EE89
        };
      break;
      case DoubleStruck:
        map = {
          0x628: 0x1EEA1,
          0x62A: 0x1EEB5,
          0x62B: 0x1EEB6,
          0x62C: 0x1EEA2,
          0x62D: 0x1EEA7,
          0x62E: 0x1EEB7,
          0x62F: 0x1EEA3,
          0x630: 0x1EEB8,
          0x631: 0x1EEB3,
          0x632: 0x1EEA6,
          0x633: 0x1EEAE,
          0x634: 0x1EEB4,
          0x635: 0x1EEB1,
          0x636: 0x1EEB9,
          0x637: 0x1EEA8,
          0x638: 0x1EEBA,
          0x639: 0x1EEAF,
          0x63A: 0x1EEBB,
          0x641: 0x1EEB0,
          0x642: 0x1EEB2,
          0x644: 0x1EEAB,
          0x645: 0x1EEAC,
          0x646: 0x1EEAD,
          0x648: 0x1EEA5,
          0x64A: 0x1EEA9
        };
      break;
      default:
        return codePoint;
    }
    return map[codePoint] ? map[codePoint] : codePoint;
  }

  // Greek
  if (greekUpperAlpha <= codePoint && codePoint <= greekUpperOmega) {
    baseChar = codePoint - greekUpperAlpha;
  } else if (greekLowerAlpha <= codePoint && codePoint <= greekLowerOmega) {
    baseChar = mathBoldSmallAlpha - mathBoldUpperAlpha + codePoint - greekLowerAlpha;
  } else {
    switch (codePoint) {
    case greekUpperTheta:
        baseChar = mathBoldUpperTheta - mathBoldUpperAlpha;
        break;
    case nabla:
        baseChar = mathBoldNabla - mathBoldUpperAlpha;
        break;
    case partialDifferential:
        baseChar = mathBoldPartialDifferential - mathBoldUpperAlpha;
        break;
    case greekLunateEpsilonSymbol:
        baseChar = mathBoldEpsilonSymbol - mathBoldUpperAlpha;
        break;
    case greekThetaSymbol:
        baseChar = mathBoldThetaSymbol - mathBoldUpperAlpha;
        break;
    case greekKappaSymbol:
        baseChar = mathBoldKappaSymbol - mathBoldUpperAlpha;
        break;
    case greekPhiSymbol:
        baseChar = mathBoldPhiSymbol - mathBoldUpperAlpha;
        break;
    case greekRhoSymbol:
        baseChar = mathBoldRhoSymbol - mathBoldUpperAlpha;
        break;
    case greekPiSymbol:
        baseChar = mathBoldPiSymbol - mathBoldUpperAlpha;
        break;
    default:
        return codePoint;
    }
  }

  switch (mathvariant) {
    case Bold:
      multiplier = 0;
      break;
    case Italic:
      multiplier = 1;
      break;
    case BoldItalic:
      multiplier = 2;
      break;
    case BoldSansSerif:
      multiplier = 3;
      break;
    case SansSerifBoldItalic:
      multiplier = 4;
      break;
    default:
      // This mathvariant isn't defined for Greek or is otherwise normal.
      return codePoint;
  }

  return baseChar + mathBoldUpperAlpha + multiplier * (mathItalicUpperAlpha - mathBoldUpperAlpha);
}

function applyMathVariant(aToken, aMathVariant) {
  var content = aToken["content"];
  var transformedText = "";
  for (var i = 0; i < content.length; i++) {
    var c = content["codePointAt"](i);
    if (c > 0xFFFF) {
      transformedText += content[i]; i++;
      transformedText += content[i];
    } else {
      transformedText += String["fromCodePoint"](
        applyMathVariantToCharacter(c, aMathVariant)
      );
    }
  }
  aToken["content"] = transformedText;
}

/* FIXME: try to restore the operator grouping when compoundTermList does not
   contain any fences.
   https://github.com/fred-wang/TeXZilla/issues/9 */
function newMrow(aList, aTag, aAttributes) {
  aTag = aTag || "mrow";
  if (aList.length == 1) {
    var child = aList[0];
    if (aTag === "mrow")
      return child;
    if (aTag === "mstyle" &&
        isToken(child) && areTokenAttributes(aAttributes)) {
      child["attributes"] = {};
      if (aAttributes["mathvariant"]) {
        if (aAttributes["mathvariant"] === "normal") {
          // Explicit "normal" attribute is only needed on single-char <mi>'s.
          if (!isSingleCharMi(child))
            delete aAttributes["mathvariant"];
        } else {
          // Transform the text instead of using a mathvariant attribute.
          applyMathVariant(child, aAttributes["mathvariant"]);
          delete aAttributes["mathvariant"];
        }
      }
      for (var name in aAttributes) {
        if (!child["attributes"][name])
          child["attributes"][name] = aAttributes[name];
      }
      return child;
    }
  }
  return newTag(aTag, aList, aAttributes);
}

function newMath(aList, aDisplay, aRTL, aTeX)
{
  return newTag("math", [
    newTag("semantics", [
      newMrow(aList),
      newTag("annotation", escapeText(aTeX), {"encoding": "TeX"})
    ])
  ], {
    "xmlns": MathMLNameSpace,
    "display": aDisplay ? "block" : undefined,
    "dir": aRTL ? "rtl" : undefined
  });
}

function getTeXSourceInternal(aMathMLElement) {
  var child;
  if (!aMathMLElement ||
      aMathMLElement.namespaceURI !== MathMLNameSpace) {
    return null;
  }

  if (aMathMLElement.tagName === "semantics") {
    // Note: we can't use aMathMLElement.children on WebKit/Blink because of
    // https://bugs.webkit.org/show_bug.cgi?id=109556.
    for (child = aMathMLElement.firstElementChild; child;
         child = child.nextElementSibling) {
      if (child.namespaceURI === MathMLNameSpace &&
          child.localName === "annotation" &&
          TeXMimeTypes.indexOf(child.getAttribute("encoding")) !== -1) {
        return child.textContent;
      }
    }
  } else if (aMathMLElement.childElementCount === 1) {
    return getTeXSourceInternal(aMathMLElement.firstElementChild);
  }

  return null;
}

try {
  // Try to create a DOM Parser object if it exists (e.g. in a Web page,
  // in a chrome script running in a window etc)
  parser.mDOMParser = new DOMParser();
} catch (e) {
  // Make the DOMParser throw an exception if used.
  parser.mDOMParser = {
    parseFromString: function() {
      throw "DOMParser undefined. Did you call TeXZilla.setDOMParser?";
    }
  };
}

parser.setDOMParser = function(aDOMParser)
{
  this.mDOMParser = aDOMParser;
}

try {
  // Try to create a XMLSerializer object if it exists (e.g. in a Web page,
  // in a chrome script running in a window etc)
  parser.mXMLSerializer = new XMLSerializer();
} catch (e) {
  // Make the XMLSerializer throw an exception if used.
  parser.mXMLSerializer = {
    serializeToString: function() {
      throw "XMLSerializer undefined. Did you call TeXZilla.setXMLSerializer?";
    }
  };
}

parser.setXMLSerializer = function(aXMLSerializer)
{
  this.mXMLSerializer = aXMLSerializer;
}

parser.parseMathMLDocument = function (aString) {
  // Parse the string into a MathML document and return the <math> root.
  return this.mDOMParser.
    parseFromString(aString, "application/xml").documentElement;
}

parser.setSafeMode = function(aEnable)
{
  this.yy.mSafeMode = aEnable;
}

parser.setItexIdentifierMode = function(aEnable)
{
  this.yy.mItexIdentifierMode = aEnable;
}

parser.getTeXSource = function(aMathMLElement) {
  if (typeof aMathMLElement === "string") {
    aMathMLElement = this.parseMathMLDocument(aMathMLElement);
  }

  return getTeXSourceInternal(aMathMLElement);
}

parser.toMathMLString = function(aTeX, aDisplay, aRTL, aThrowExceptionOnError) {
  var output, mathml;
  /* Parse the TeX source and get the main MathML node. */
  try {
    output = this.parse("\\(" + aTeX + "\\)");
    if (aRTL) {
      /* Set the RTL mode if specified. */
      output = output.replace(/^<math/, "<math dir=\"rtl\"");
    }
    if (aDisplay) {
      /* Set the display mode if it is specified. */
      output = output.replace(/^<math/, "<math display=\"block\"");
    }
  } catch (e) {
    if (aThrowExceptionOnError) {
       throw e;
    }
    output = serializeTree(newMath(
      [newTag("merror",
              [newTag("mtext", escapeText(e.message))]
             )],
      aDisplay, aRTL, aTeX));
  }

  return output;
}

parser.toMathML = function(aTeX, aDisplay, aRTL, aThrowExceptionOnError) {
  /* Parse the TeX string into a <math> element. */
  return this.parseMathMLDocument(this.toMathMLString(aTeX, aDisplay, aRTL, aThrowExceptionOnError));
}

function escapeHTML(aString)
{
    var rv = "", code1, code2;
    for (var i = 0; i < aString.length; i++) {
        var code1 = aString.charCodeAt(i);
        if (code1 < 0x80) {
          rv += aString.charAt(i);
          continue;
        }
        if (0xD800 <= code1 && code1 <= 0xDBFF) {
          i++;
          code2 = aString.charCodeAt(i);
          rv += "&#x" +
             ((code1-0xD800)*0x400 + code2-0xDC00 + 0x10000).toString(16) + ";";
          continue;
        }
        rv += "&#x" + code1.toString(16) + ";";
    }
    return rv;
}

parser.toImage = function(aTeX, aRTL, aRoundToPowerOfTwo, aSize, aDocument) {
  var math, el, box, svgWidth, svgHeight, svg, image;

  // Set default values.
  if (aSize === undefined) {
    aSize = 64;
  }
  if (aDocument === undefined) {
    aDocument = window.document;
  }

  // Create the MathML element.
  math = this.toMathML(aTeX, true, aRTL);
  math.setAttribute("mathsize", aSize + "px");

  // Temporarily insert the MathML element in the document to measure it.
  el = document.createElement("div");
  el.style.visibility = "hidden";
  el.style.position = "absolute";
  el.appendChild(math);
  aDocument.body.appendChild(el);
  box = math.getBoundingClientRect();
  aDocument.body.removeChild(el);
  el.removeChild(math);

  // Round up the computed sizes.
  if (aRoundToPowerOfTwo) {
    // Harmony's Math.log2() is not supported by all rendering engines and is
    // removed by closure-compiler, so we use Math.log() / Math.LN2 instead.
    svgWidth = Math.pow(2, Math.ceil(Math.log(box.width) / Math.LN2));
    svgHeight = Math.pow(2, Math.ceil(Math.log(box.height) / Math.LN2));
  } else {
    svgWidth = Math.ceil(box.width);
    svgHeight = Math.ceil(box.height);
  }

  // Embed the MathML in an SVG element.
  svg = document.createElementNS(SVGNameSpace, "svg");
  svg.setAttribute("width", svgWidth + "px");
  svg.setAttribute("height", svgHeight + "px");
  el = document.createElementNS(SVGNameSpace, "g");
  el.setAttribute("transform", "translate(" +
    (svgWidth - box.width) / 2.0 + "," + (svgHeight - box.height) / 2.0 + ")");
  svg.appendChild(el);
  el = document.createElementNS(SVGNameSpace, "foreignObject");
  el.setAttribute("width", box.width);
  el.setAttribute("height", box.height);
  el.appendChild(math);
  svg.firstChild.appendChild(el);

  // Create the image element.
  image = new Image();
  image.src = "data:image/svg+xml;base64," +
    window.btoa(escapeHTML(this.mXMLSerializer.serializeToString(svg)));
  image.width = svgWidth;
  image.height = svgHeight;
  image.alt = escapeText(aTeX);

  return image;
}

parser.filterString = function(aString, aThrowExceptionOnError) {
  try {
    return this.parse(aString);
  } catch (e) {
    if (aThrowExceptionOnError) {
       throw e;
    }
    return aString;
  }
}

parser.filterElement = function(aElement, aThrowExceptionOnError) {
  var root, child, node;
  for (var node = aElement.firstChild; node; node = node.nextSibling) {
    switch(node.nodeType) {
      case 1: // Node.ELEMENT_NODE
        this.filterElement(node, aThrowExceptionOnError);
      break;
      case 3: // Node.TEXT_NODE
        this.yy.escapeXML = true;
        root = this.mDOMParser.parseFromString("<root>" +
               TeXZilla.filterString(node.data, aThrowExceptionOnError) +
               "</root>", "application/xml").documentElement;
        this.yy.escapeXML = false;
        while (child = root.firstChild) {
          aElement.insertBefore(root.removeChild(child), node);
        }
        child = node.previousSibling;
        aElement.removeChild(node); node = child;
        break;
      default:
    }
  }
}

function parseError(aString, aHash) {
    // We delete the last line, which contains token names that are obscure
    // to the users. See issue #16
    throw new Error(aString.replace(/\nExpecting [^\n]*$/, "\n"));
}

%}

/* Operator associations and precedence. */
%left TEXOVER TEXATOP TEXCHOOSE
%right "^" "_" "OPP"

%start document

%%

/* text option argument */
textOptArg
  : "[" TEXTOPTARG "]" {
    /* Unescape \] and \\. */
    $$ = $2.replace(/\\[\\\]]/g, function(match) { return match.slice(1); });
    /* Escape some XML characters. */
    $$ = escapeText($$);
  }
  ;

/* text argument */
textArg
  : "{" TEXTARG "}" {
    /* Unescape \} and \\. */
    $$ = $2.replace(/\\[\\\}]/g, function(match) { return match.slice(1); });
    /* Escape some XML characters. */
    $$ = escapeText($$);
  }
  ;

/* length optional argument */
lengthOptArg
  : "[" TEXTOPTARG "]" {
    $$ = parseLength($2);
  }
  ;

/* length argument */
lengthArg
  : "{" TEXTARG "}" {
    $$ = parseLength($2);
  }
  ;

/* attribute optional argument */
attrOptArg
  : textOptArg { $$ = escapeQuote($1); }
  ;

/* attribute argument */
attrArg
  : textArg { $$ = escapeQuote($1); }
  ;

/* MathML token content */
tokenContent
  : textArg {
    /* The MathML specification indicates that trailing/leading whitespaces
       should be removed and that inner whitespace should be collapsed. Let's
       replace trailing/leading whitespace by no-break space so that people can
       write e.g. \text{ if }. We also collapse internal whitespace here.
       See https://github.com/fred-wang/TeXZilla/issues/25. */
    $$ = $1.replace(/\s+/g, " ").replace(/^ | $/g, "\u00A0");
  }
  ;

/* array alignment */
arrayAlign
  : textOptArg {
    $1 = $1.trim();
    if ($1 === "t") {
      $$ = "axis 1";
    } else if ($1 === "c") {
      $$ = "center";
    } else if ($1 === "b") {
      $$ = "axis -1";
    } else {
      throw "Unknown array alignment";
    }
  }
  ;

/* array column alignment */
columnAlign
  : textArg {
    $$ = "";
    $1 = $1.replace(/\s+/g, "");;
    for (var i = 0; i < $1.length; i++) {
      if ($1[i] === "c") {
        $$ += " center";
      } else if ($1[i] === "l") {
        $$ += " left";
      } else if ($1[i] === "r") {
        $$ += " right";
      }
    }
    if ($$.length) {
        $$ = $$.slice(1);
    } else {
        throw "Invalid column alignments";
    }
  }
  ;

/* table attributes */
collayout: COLLAYOUT attrArg { $$ = {"columnalign": $2}; };
colalign: COLALIGN attrArg { $$ = {"columnalign": $2}; };
rowalign: ROWALIGN attrArg { $$ = {"rowalign": $2}; };
rowspan: ROWSPAN attrArg { $$ = {"rowspan": $2}; };
colspan: COLSPAN attrArg { $$ = {"colspan": $2}; };
align: ALIGN attrArg { $$ = {"align": $2}; };
eqrows: EQROWS attrArg { $$ = {"equalrows": $2}; };
eqcols: EQCOLS attrArg { $$ = {"equalcolumns": $2}; };
rowlines: ROWLINES attrArg { $$ = {"rowlines": $2}; };
collines: COLLINES attrArg { $$ = {"columnlines": $2}; };
frame: FRAME attrArg { $$ = {"frame": $2}; };
padding: PADDING attrArg { $$ = {"rowspacing": $2, "columnspacing": $2}; };

/* cell option */
cellopt
  : colalign { $$ = $1; }
  | rowalign { $$ = $1; }
  | rowspan { $$ = $1; }
  | colspan { $$ = $1; }
  ;

/* list of cell options */
celloptList
  : cellopt { $$ = $1; }
  | celloptList cellopt { $$ = Object.assign($1, $2); }
  ;

/* row option */
rowopt
  : colalign { $$ = $1; }
  | rowalign { $$ = $1; }
  ;

/* array option */
arrayopt
  : collayout { $$ = $1; }
  | colalign { $$ = $1; }
  | rowalign { $$ = $1; }
  | align { $$ = $1; }
  | eqrows { $$ = $1; }
  | eqcols { $$ = $1; }
  | rowlines { $$ = $1; }
  | collines { $$ = $1; }
  | frame { $$ = $1; }
  | padding { $$ = $1; }
  ;

/* list of array options */
arrayoptList
  : arrayopt { $$ = $1; }
  | arrayoptList arrayopt { $$ = Object.assign($1, $2); }
  ;

/* list of row options */
rowoptList
  : rowopt { $$ = $1; }
  | rowoptList rowopt { $$ = Object.assign($1, $2); }
  ;

/* left fence */
left
  : LEFT OPFS {
    $$ = newMo($2);
  }
  | LEFT "." {
    $$ = "";
  }
  ;

/* right fence */
right
  : RIGHT OPFS {
    $$ = newMo($2);
  }
  | RIGHT "." {
    $$ = "";
  }
  ;

/* closed terms */
closedTerm
  : "{" "}" { $$ = newTag("mrow"); }
  | "{" styledExpression "}" { $$ = newMrow($2); }
  | BIG OPFS {
    $$ = newTag("mo", $2, {"maxsize": "1.2em", "minsize": "1.2em"});
  }
  | BBIG OPFS {
    $$ = newTag("mo", $2, {"maxsize": "1.8em", "minsize": "1.8em"});
  } 
  | BIGG OPFS {
    $$ = newTag("mo", $2, {"maxsize": "2.4em", "minsize": "2.4em"});
  }
  | BBIGG OPFS {
    $$ = newTag("mo", $2, {"maxsize": "3em", "minsize": "3em"});
  }
  | BIGL OPFS {
    $$ = newTag("mo", $2, {"maxsize": "1.2em", "minsize": "1.2em"});
  }
  | BBIGL OPFS {
    $$ = newTag("mo", $2, {"maxsize": "1.8em", "minsize": "1.8em"});
  }
  | BIGGL OPFS {
    $$ = newTag("mo", $2, {"maxsize": "2.4em", "minsize": "2.4em"});
  }
  | BBIGGL OPFS {
    $$ = newTag("mo", $2, {"maxsize": "3em", "minsize": "3em"});
  }
  | left styledExpression right {
    $$ = newTag("mrow", [$1, newMrow($2), $3]);
  }
  | "{" styledExpression TEXATOP styledExpression "}" {
    $$ = newTag("mfrac", [newMrow($2), newMrow($4)], {"linethickness": "0px"});
  }
  | left styledExpression TEXATOP styledExpression right {
    $$ = newTag("mfrac", [newMrow($2), newMrow($4)], {"linethickness": "0px"});
    $$ = newTag("mrow", [$1, $$, $5]);
  }
  | "{" styledExpression TEXOVER styledExpression "}" {
    $$ = newTag("mfrac", [newMrow($2), newMrow($4)]);
  }
  | left styledExpression TEXOVER styledExpression right {
    $$ = newTag("mfrac", [newMrow($2), newMrow($4)]);
    $$ = newTag("mrow", [$1, $$, $5]);
  }
  | "{" styledExpression TEXCHOOSE styledExpression "}" {
    $$ = newTag("mfrac", [newMrow($2), newMrow($4)], {"linethickness": "0px"});
    $$ = newTag("mrow", [newMo("("), $$, newMo(")")]);
  }
  | left styledExpression TEXCHOOSE styledExpression right {
    $$ = newTag("mfrac", [newMrow($2), newMrow($4)], {"linethickness": "0px"});
    $$ = newTag("mrow", [$1, $$, $5]);
    $$ = newTag("mrow", [newMo("("), $$, newMo(")")]);
  }
  | NUM { $$ = newTag("mn", $1); }
  | TEXT { $$ = newTag("mtext", $1); }
  | A { $$ = newTag("mi", escapeText($1)); }
  | F { $$ = newMo($1, 0, 0); }
  | MI tokenContent { $$ = newTag("mi", $2); }
  | MN tokenContent { $$ = newTag("mn", $2); }
  | MO tokenContent { $$ = newMo($2); }
  | "." { $$ = newMo($1); }
  | OP { $$ = newMo($1); }
  | OPS { $$ = newTag("mo", $1, {"stretchy": "false"}); }
  | OPAS { $$ = newTag("mo", $1, {"stretchy": "false"}); }
  | OPFS { $$ = newTag("mo", $1, {"stretchy": "false"}); }
  | MS tokenContent { $$ = newTag("ms", $2); }
  | MS attrOptArg attrOptArg tokenContent {
     $$ = newTag("ms", $4, {"lquote": $2, "rquote": $3});
  }
  | MTEXT tokenContent { $$ = newTag("mtext", $2); }
  | HIGH_SURROGATE LOW_SURROGATE { $$ = newTag("mtext", $1 + $2); }
  | BMP_CHARACTER { $$ = newTag("mtext", $1); }
  | OPERATORNAME textArg {
    $$ = newMo($2, 0, namedSpaceToEm("thinmathspace"));
  }
  | MATHOP textArg {
    $$ = newMo($2, namedSpaceToEm("thinmathspace"),
                   namedSpaceToEm("thinmathspace"));
  }
  | MATHBIN textArg {
    $$ = newMo($2, namedSpaceToEm("mediummathspace"),
                   namedSpaceToEm("mediummathspace"));
  }
  | MATHREL textArg {
    $$ = newMo($2, namedSpaceToEm("thickmathspace"),
                   namedSpaceToEm("thickmathspace"));
  }
  | FRAC closedTerm closedTerm { $$ = newTag("mfrac", [$2, $3]); }
  | ROOT closedTerm closedTerm { $$ = newTag("mroot", [$3, $2]); }
  | SQRT closedTerm { $$ = newTag("msqrt", [$2]); }
  | SQRT "[" styledExpression "]" closedTerm {
    $$ = newTag("mroot", [$5, newMrow($3)]);
  }
  | UNDERSET closedTerm closedTerm { $$ = newTag("munder", [$3, $2]); }
  | OVERSET closedTerm closedTerm { $$ = newTag("mover", [$3, $2]); }
  | UNDEROVERSET closedTerm closedTerm closedTerm {
    $$ = newTag("munderover", [$4, $2, $3]); }
  }
  | XARROW "[" styledExpression "]" closedTerm {
    $$ = (isEmptyMrow($5) ?
          newTag("munder", [newMo($1), newMrow($3)]) :
          newTag("munderover", [newMo($1), newMrow($3), $5]));
  }
  | XARROW closedTerm {
    $$ = newTag("mover", [newMo($1), $2]);
  }
  | MATHRLAP closedTerm { $$ = newTag("mpadded", [$2], {"width": "0em"}); }
  | MATHLLAP closedTerm {
    $$ = newTag("mpadded", [$2], {"width": "0em", "lspace": "-100%width"});
  }
  | MATHCLAP closedTerm {
    $$ = newTag("mpadded", [$2], {"width": "0em", "lspace": "-50%width"});
  }
  | PHANTOM closedTerm { $$ = newTag("mphantom", [$2]); }
  | TFRAC closedTerm closedTerm {
    $$ = newTag("mfrac", [$2, $3]);
    $$ = newMrow([$$], "mstyle", {"displaystyle": "false"});
  }
  | BINOM closedTerm closedTerm {
    $$ = newTag("mfrac", [$2, $3], {"linethickness": "0px"});
    $$ = newTag("mrow", [newMo("("), $$, newMo(")")]);
  }
  | TBINOM closedTerm closedTerm {
    $$ = newTag("mfrac", [$2, $3], {"linethickness": "0px"});
    $$ = newMrow([$$], "mstyle", {"displaystyle": "false"});
    $$ = newTag("mrow", [newMo("("), $$, newMo(")")]);
  }
  | PMOD closedTerm {
    $$ = newTag("mrow",
                [newMo("(", namedSpaceToEm("mediummathspace")),
                newMo("mod", undefined, namedSpaceToEm("thinmathspace")), $2,
                newMo(")", undefined, namedSpaceToEm("mediummathspace"))]);
  }
  | UNDERBRACE closedTerm { $$ = newTag("munder", [$2, newMo("\u23DF")]); }
  | UNDERLINE closedTerm { $$ = newTag("munder", [$2, newMo("_")]); }
  | OVERBRACE closedTerm { $$ = newTag("mover", [$2, newMo("\u23DE")]); }
  | ACCENT closedTerm {
    $$ = newTag("mover", [$2, newMo($1)]);
  }
  | ACCENTNS closedTerm {
    $$ = newTag("mover", [$2, newTag("mo", $1, {"stretchy": "false"})]);
  }
  | BOXED closedTerm { $$ = newTag("menclose", [$2], {"notation": "box"}); }
  | SLASH closedTerm {
    $$ = newTag("menclose", [$2], {"notation": "updiagonalstrike"});
  }
  | QUAD { $$ = newSpace(1); }
  | QQUAD { $$ = newSpace(2); }
  | NEGSPACE { $$ = newSpace(namedSpaceToEm("negativethinmathspace")); }
  | NEGMEDSPACE { $$ = newSpace(namedSpaceToEm("negativemediummathspace")); }
  | NEGTHICKSPACE { $$ = newSpace(namedSpaceToEm("negativethickmathspace")); }
  | THINSPACE { $$ = newSpace(namedSpaceToEm("thinmathspace")); }
  | MEDSPACE { $$ = newSpace(namedSpaceToEm("mediummathspace")); }
  | THICKSPACE { $$ = newSpace(namedSpaceToEm("thickmathspace")); }
  | SPACE textArg textArg textArg {
    $$ =  newTag("mspace", null,
                 {"height": "." + $2 + "ex",
                  "depth": "." + $3 + "ex",
                  "width": "." + $4 + "em"});
  }
  | MATHRAISEBOX lengthArg lengthOptArg lengthOptArg closedTerm {
    $$ = newTag("mpadded", [$5],
                {"voffset": $2.l + $2.u,
                 "height": $3.l + $3.u,
                 "depth": $4.l + $4.u});
  }
  | MATHRAISEBOX lengthArg lengthOptArg closedTerm {
    $$ = newTag("mpadded", [$4],
                {"voffset": $2.l + $2.u,
                "height": $3.l + $3.u,
                "depth": ($2.l < 0 ? "+" + (-$2.l) + $2.u : "depth")});
  }
  | MATHRAISEBOX lengthArg closedTerm {
    var attributes = {"voffset": $2.l + $2.u};
    if ($2.l >= 0)
      attributes.height = "+" + $2.l + $2.u;
    else {
      attributes.height = "0pt";
      attributes.depth = "+" + (-$2.l) + $2.u;
    }
    $$ = newTag("mpadded", [$3], attributes);
  }
  | MATHBB closedTerm {
    $$ = newMrow([$2], "mstyle", {"mathvariant": "double-struck"});
  }
  | MATHBF closedTerm { $$ = newMrow([$2], "mstyle", {"mathvariant": "bold"}); }
  | MATHBIT closedTerm { $$ = newMrow([$2], "mstyle",
                                     {"mathvariant": "bold-italic"}); }
  | MATHSCR closedTerm { $$ = newMrow([$2], "mstyle",
                                     {"mathvariant": "script"}); }
  | MATHBSCR closedTerm {
    $$ = newMrow([$2], "mstyle", {"mathvariant": "bold-script"});
  }
  | MATHSF closedTerm {
    $$ = newMrow([$2], "mstyle", {"mathvariant": "sans-serif"});
  }
  | MATHFRAK closedTerm { $$ = newMrow([$2], "mstyle",
                                      {"mathvariant": "fraktur"}); }
  | MATHIT closedTerm { $$ = newMrow([$2], "mstyle",
                                    {"mathvariant": "italic"}); }
  | MATHTT closedTerm { $$ = newMrow([$2], "mstyle",
                                    {"mathvariant": "monospace"}); }
  | MATHRM closedTerm { $$ = newMrow([$2], "mstyle",
                                    {"mathvariant": "normal"}); }
  | HREF attrArg closedTerm {
    $$ = newTag("mrow", [$3], yy.mSafeMode ? null : {"href": $2});
  }
  | STATUSLINE textArg closedTerm {
    $$ = yy.mSafeMode ? $3 :
         newTag("maction",
                [$3, newTag("mtext", $2)], {"actiontype": "statusline"});
  }
  | TOOLTIP textArg closedTerm {
    $$ = yy.mSafeMode ? $3 :
         newTag("maction",
                [$3, newTag("mtext", $2)], {"actiontype": "tooltip"});
  }
  | TOGGLE closedTerm closedTerm {
    /* Backward compatibility with itex2MML */
    $$ = yy.mSafeMode ? $3 :
         newTag("maction", [$2, $3], {"actiontype": "toggle", selection: "2"});
  }
  | BTOGGLE closedTermList ETOGGLE {
    $$ = yy.mSafeMode ? newTag("mrow", $2) :
         newTag("maction", $2, {"actiontype": "toggle"});
  }
  | TENSOR closedTerm "{" subsupList "}" {
    $$ = newTag("mmultiscripts", [$2].concat($4));
  }
  | MULTI "{" subsupList "}" closedTerm "{" subsupList "}" {
    $$ = newTag("mmultiscripts", [$5].concat($7).concat(newTag("mprescripts")).concat($3));
  }
  | MULTI "{" subsupList "}" closedTerm "{" "}" {
    $$ = newTag("mmultiscripts", [$5, newTag("mprescripts")].concat($3));
  }
  | MULTI "{" "}" closedTerm "{" subsupList "}" {
    $$ = newTag("mmultiscripts", [$4].concat($6));
  }
  | BMATRIX tableRowList EMATRIX {
    $$ = newTag("mtable", $2, {"displaystyle": "false", "rowspacing": "0.5ex"});
  }
  | BGATHERED tableRowList EGATHERED {
    $$ = newTag("mtable", $2, {"displaystyle": "true", "rowspacing": "1.0ex"});
  }
  | BPMATRIX tableRowList EPMATRIX {
    $$ = newTag("mtable", $2, {"displaystyle": "false", "rowspacing": "0.5ex"});
    $$ = newTag("mrow", [newMo("("), $$, newMo(")")]);
  }
  | BBMATRIX tableRowList EBMATRIX {
    $$ = newTag("mtable", $2, {"displaystyle": "false", "rowspacing": "0.5ex"});
    $$ = newTag("mrow", [newMo("["), $$, newMo("]")]);
  }
  | BVMATRIX tableRowList EVMATRIX {
    $$ = newTag("mtable", $2, {"displaystyle": "false", "rowspacing": "0.5ex"});
    $$ = newTag("mrow", [newMo("|"), $$, newMo("|")]);
  }
  | BBBMATRIX tableRowList EBBMATRIX {
    $$ = newTag("mtable", $2, {"displaystyle": "false", "rowspacing": "0.5ex"});
    $$ = newTag("mrow", [newMo("{"), $$, newMo("}")]);
  }
  | BVVMATRIX tableRowList EVVMATRIX {
    $$ = newTag("mtable", $2, {"displaystyle": "false", "rowspacing": "0.5ex"});
    $$ = newTag("mrow", [newMo("\u2016"), $$, newMo("\u2016")]);
  }
  | BSMALLMATRIX tableRowList ESMALLMATRIX {
    $$ = newTag("mtable", $2, {"displaystyle": "false", "rowspacing": "0.5ex"});
    $$ = newMrow([$$], "mstyle", {"scriptlevel": "2"});
  }
  | BCASES tableRowList ECASES {
    $$ = newTag("mtable", $2, {"displaystyle": "false",
                               "columnalign": "left left"});
    $$ = newTag("mrow", [newMo("{"), $$]);
  }
  | BALIGNED tableRowList EALIGNED {
    $$ = newTag("mtable", $2, {"displaystyle": "true",
                               "columnalign": "right left right left right left right left right left",
                               "columnspacing": "0em"});
  }
  | BARRAY arrayAlign columnAlign tableRowList EARRAY {
    $$ = newTag("mtable", $4,
                {"displaystyle": "false", "rowspacing": "0.5ex", "align": $2,
                 "columnalign": $3});
  }
  | BARRAY columnAlign tableRowList EARRAY {
    $$ = newTag("mtable", $3,
                {"displaystyle": "false", "rowspacing": "0.5ex",
                 "columnalign": $2});
  }
  | SUBSTACK "{" tableRowList "}" {
    $$ = newTag("mtable", $3,
                {"displaystyle": "false", "columnalign": "center",
                 "rowspacing": "0.5ex"});
  }
  | ARRAY "{" tableRowList "}" {
    $$ = newTag("mtable", $3, {"displaystyle": "false"});
  }
  | ARRAY "{" ARRAYOPTS "{" arrayoptList "}" tableRowList "}" {
    $$ = newTag("mtable", $7, Object.assign($5, {"displaystyle": "false"}));
  }
  ;

/* list of closed terms */
closedTermList
  : closedTerm {
    $$ = [$1];
  }
  | closedTermList closedTerm {
    $$ = $1.concat([$2]);
  }
  ;

/* compound terms (closed terms with scripts) */
compoundTerm
  : TENSOR closedTerm subsupList {
    $$ = newTag("mmultiscripts", [$2].concat($3));
  }
  | closedTerm "_" closedTerm "^" closedTerm {
    $$ = newTag("msubsup", [$1, $3, $5]);
  }
  | closedTerm "_" closedTerm OPP {
    $$ = newTag("msubsup", [$1, $3, newMo($4)]);
  }
  | closedTerm "^" closedTerm "_" closedTerm {
    $$ = newTag("msubsup", [$1, $5, $3]);
  }
  | closedTerm OPP "_" closedTerm {
    $$ = newTag("msubsup", [$1, $4, newMo($2)]);
  }
  | closedTerm "_" closedTerm {
    $$ = newTag("msub", [$1, $3]);
  }
  | closedTerm "^" closedTerm {
    $$ = newTag("msup", [$1, $3]);
  }
  | closedTerm OPP {
    $$ = newTag("msup", [$1, newMo($2)]);
  }
  | closedTerm { $$ = $1; }
  | opm "_" closedTerm "^" closedTerm {
    $$ = newTag("munderover", [$1, $3, $5]);
  }
  | opm "^" closedTerm "_" closedTerm {
    $$ = newTag("munderover", [$1, $5, $3]);
  }
  | opm "_" closedTerm {
    $$ = newTag("munder", [$1, $3]);
  }
  | opm "^" closedTerm {
    $$ = newTag("mover", [$1, $3]);
  }
  | opm { $$ = $1; }
  ;

opm
  : OPM { $$ = newMo($1); }
  | FM { $$ = newMo($1, 0, 0); }
  ;

/* list of compound terms */
compoundTermList
  : compoundTerm { $$ = [$1]; }
  | compoundTermList compoundTerm { $$ = $1.concat([$2]); }
  ;

/* subsup term */
subsupTermScript
  : closedTerm { $$ = $1; }
  | opm { $$ = $1; }
  ;

/* subsup term as scripts */
subsupTerm
  : "_" subsupTermScript "^" subsupTermScript { $$ = [$2, $4]; }
  | "_" subsupTermScript { $$ = [$2, newTag("none")]; }
  | "^" subsupTermScript { $$ = [newTag("none"), $2]; }
  | "_" "^" subsupTermScript { $$ = [newTag("none"), $3]; }
  ;

/* list of subsup terms */
subsupList
  : subsupTerm { $$ = $1; }
  | subsupList subsupTerm { $$ = $1.concat($2); }
  ;

/* text style */
textstyle
  : DISPLAYSTYLE { $$ = {"displaystyle": "true"}; }
  | TEXTSTYLE { $$ = {"displaystyle": "false"}; }
  | TEXTSIZE { $$ = {"scriptlevel": "0"}; }
  | SCRIPTSIZE { $$ = {"scriptlevel": "1"}; }
  | SCRIPTSCRIPTSIZE { $$ = {"scriptlevel": "2"}; }
  | COLOR attrArg { $$ = {"mathcolor": $2}; }
  | BGCOLOR attrArg { $$ = {"mathbackground": $2}; }
  ;

/* styled expression (compoundTermList with additional style) */
styledExpression
  : textstyle styledExpression { $$ = [newMrow($2, "mstyle", $1)]; }
  | compoundTermList { $$ = $1; }
  ;

/* table cell */
tableCell
  : { $$ = newTag("mtd", []); }
  | CELLOPTS "{" celloptList "}" styledExpression {
    $$ = newMrow($5, "mtd", $3);
  }
  | styledExpression { $$ = newMrow($1, "mtd"); }
  ;

/* list of table cells */
tableCellList
  : tableCell { $$ = [$1]; }
  | tableCellList COLSEP tableCell { $$ = $1.concat([$3]); }
  ;

/* table row */
tableRow
  : ROWOPTS "{" rowoptList "}" tableCellList {
    $$ = $$ = newTag("mtr", $5, $3);
  }
  | tableCellList { $$ = newTag("mtr", $1); }
  ;

/* list of table rows */
tableRowList
  : tableRow { $$ = [$1]; }
  | tableRowList ROWSEP tableRow { $$ = $1.concat([$3]); }
  ;

/* a document with embedded math */
document
  : documentItemList EOF {
    $$ = $1
    return $$;
  }
  ;

documentItemList
  : documentItem { $$ = $1; }
  | documentItemList documentItem { $$ = $1 + $2 }
  ;

documentItem
  : TEXT { $$ = $1; }
  | mathItem {
    $$ = serializeTree($1);
  }
  ;

mathItem
  : STARTMATH0 ENDMATH0 {
    // \( \)
    $$ = newMath([newTag("mrow")], false, false, yy.tex);
  }
  | STARTMATH0 styledExpression ENDMATH0 {
    // \( ... \)
    $$ = newMath($2, false, false, yy.tex);
  }
  | STARTMATH1 ENDMATH1 {
    // \[ \]
    $$ = newMath([newTag("mrow")], true, false, yy.tex);
  }
  | STARTMATH1 styledExpression ENDMATH1 {
    // \[ ... \]
    $$ = newMath($2, true, false, yy.tex);
  }
  | STARTMATH2 styledExpression ENDMATH2 {
    // $ ... $
    $$ = newMath($2, false, false, yy.tex);
  }
  | STARTMATH3 styledExpression ENDMATH3 {
    // $$ ... $$
    $$ = newMath($2, true, false, yy.tex);
  }
  ;
