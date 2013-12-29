/*
 Copyright (C) 2013-2014 Frederic Wang

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

%{
function escapeText(aString)
{
  /* Escape reserved XML characters for use as text nodes. */
  return aString.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function escapeQuote(aString)
{
  /* Escape the double quote characters for use as attribute. */
  return aString.replace(/"/g, "&#x22;");
}

function newTag(aTag, aContent, aAttributes)
{
  /* Create a new tag with the specified content and attributes. */
  var tag = "<" + aTag;
  if (aAttributes) tag += " " + aAttributes
  tag += ">" + aContent + "</" + aTag + ">";
  return tag;
}

function newMo(aContent)
{
  /* Create a new operator */
  return "<mo>" + escapeText(aContent) + "</mo>";
}

function newScript(aUnderOver, aBase, aScriptBot, aScriptTop)
{
  /* Create a new MathML script element. */
  if (aUnderOver) {
    if (!aScriptBot) {
       return "<mover>" + aBase + aScriptTop + "</mover>";
    }
    if (!aScriptTop) {
       return "<munder>" + aBase + aScriptBot + "</munder>";
    }
    return "<munderover>" + aBase + aScriptBot + aScriptTop + "</munderover>";
  }
  if (!aScriptBot) {
    return "<msup>" + aBase + aScriptTop + "</msup>";
  }
  if (!aScriptTop) {
    return "<msub>" + aBase + aScriptBot + "</msub>";
  }
  return "<msubsup>" + aBase + aScriptBot + aScriptTop + "</msubsup>";
}

function newMrow(aList, tagName)
{
  if (!tagName) {
    if (aList.length == 1) {
      /* This list only has one element so we just return it. */
      return aList[0];
    }
    tagName = "mrow";
  }
  return "<" + tagName + ">" + aList.join("") + "</" + tagName + ">";
}

function appendList(aList1, aList2)
{
   /* Append the content of aList2 to aList1. */
   if (aList2.priority > aList1.priority) {
     /* Wrap the content of aList2 into an <mrow> before appending it. */
     aList1.list.push(newMrow(aList2.list));
   } else {
     /* Just concatenate the two lists. */
     aList1.list = aList1.list.concat(aList2.list);
   }
}

function newIsolated(aPriority, aElement)
{
  return { list: [aElement], priority: aPriority };
}

function newUnary(aPriority, aOperator, aOperand)
{
  var l = { list: [aOperator], priority: aPriority };
  appendList(l, aOperand);
  return l;
}

function newPostfixUnary(aPriority, aOperand, aOperator)
{
  var l = { list: [], priority: aPriority };
  appendList(l, aOperand);
  l.list.push(aOperator);
  return l;
}

function newBinary(aPriority, aLeft, aOperator, aRight)
{
  var l = { list: [], priority: aPriority };
  appendList(l, aLeft);
  l.list.push(aOperator);
  appendList(l, aRight);
  return l;
}

var MathMLNameSpace = "http://www.w3.org/1998/Math/MathML";
var TeXMimeTypes = ["TeX", "LaTeX", "text/x-tex", "text/x-latex",
                    "application/x-tex", "application/x-latex"];

function parseMathMLDocument(aString)
{
  return (new DOMParser()).
    parseFromString(aString, "application/xml").documentElement;
}

function getTeXSourceInternal(aMathMLElement)
{
  if (!(aMathMLElement instanceof Element) ||
      aMathMLElement.namespaceURI !== MathMLNameSpace) {
    return null;
  }

  if (aMathMLElement.tagName === "semantics") {
    var tags = aMathMLElement.getElementsByTagName("annotation");
    for (var i = 0; i < tags.length; i++) {
      if (TeXMimeTypes.indexOf(tags[i].getAttribute("encoding")) !== -1) {
        return tags[i].textContent;
      }
    }
  } else if (aMathMLElement.childElementCount === 1) {
    return getTeXSourceInternal(aMathMLElement.firstElementChild);
  }

  return null;
}

parser.getTeXSource = function(aMathMLElement)
{
  if (typeof aMathMLElement === "string") {
    aMathMLElement = parseMathMLDocument(aMathMLElement);
  }

  return getTeXSourceInternal(aMathMLElement);
}

parser.toMathMLString = function(aTeX, aDisplay)
{
  /* Parse the TeX source and get the main MathML node. */
  var output;
  try {
    output = this.parse(aTeX);
  } catch(e) {
    output = { source: "<merror>" + escapeText(e.message) + "</merror>" };
  }

  /* Add the <math> root and attach the TeX annotation. */
  var mathml = "<math xmlns=\"" + MathMLNameSpace + "\"";
  if (output.display || aDisplay) {
    /* Set the display mode if it has been detected or specified. */
    mathml += " display=\"block\""
  }
  mathml += "><semantics>" + output.source
  mathml += "<annotation encoding=\"TeX\">";
  mathml += escapeText(aTeX);
  mathml += "</annotation></semantics></math>";

  return mathml;
}

parser.toMathML = function(aTeX, aDisplay)
{
  return parseMathMLDocument(this.toMathMLString(aTeX, aDisplay));
}
%}

/* Operator associations and precedence. */
%left textstyle
%left MOINF30 /* ; */
%left MOINF40 /* , */
%left MOINF70
%right MOPOS100 /* .. ... */
%left MOINF100
%left MOINF110
%left MOINF150
%left MOINF160
%left MOINF170
%left MOINF190
%left MOINF200
%left MOPRE230
%left MOINF240
%left MOINF241
%left MOINF242
%left MOINF243
%left MOINF244
%left MOINF245
%left MOINF246
%left MOINF247
%left MOINF250
%left MOINF252
%left MOINF255
%left MOINF260 /* = */
%left MOINF265
%left MOSINF265
%left MOINF270
%left MOINF275
%left MOSINF270
%left MOINFPRE275 /* +, - */
%left MOINFPRE275_PRE /* +, - prefix */
%left mo290
%left MOINF300
%left mo300
%left mo310
%left mo320
%left mo330
%left MOINF340
%left MOINF350
%left mo350
%left MOINF390 /* × */
%left MOINF400
%left MOINF410
%left MOINF640
%left MOINF650
%left MOINF660
%left MOPRE670
%left MOPRE680
%left MOINF710
%left MOPRE740
%right MOPOS800
%right MOPOS810
%left MOINF825
%left MOINF835
%left MOPRE845
%left MOSPRE845
%left MOINF850
%left MOINF880
%right MOPOS880

%left TEXOVER TEXATOP TEXCHOOSE

%left "^" "_"

%start math

%% /* language grammar */

math
  : expressionList EOF {
    $$ = { source: newMrow($1.list), display: false };
    return $$;
  }
  | EOF {
    $$ = { source: "<mrow/>", display: false };
    return $$;
  }
  ;

textOptArg
  : "[" TEXTOPTARG "]" {
    /* Unescape \] and \\. */
    $$ = $2.replace(/\\[\\\]]/g, function(match) { return match.slice(1); });
    /* Escape some XML characters. */
    $$ = escapeText($$);
  }
  ;

textArg
  : "{" TEXTARG "}" {
    /* Unescape \} and \\. */
    $$ = $2.replace(/\\[\\\}]/g, function(match) { return match.slice(1); });
    /* Escape some XML characters. */
    $$ = escapeText($$);
  }
  ;

tokenContent
  : textArg {
    /* Collapse the whitespace as indicated in the MathML specification. */
    $$ = $1.trim().replace(/\s+/g, " ");
  }
  ;

closedTerm
  : "{" "}" { $$ = "<mrow/>"; }
  | "{" expressionList "}" { $$ = newMrow($2.list); }
  | BIG MOFS {
    $$ = newTag("mo", $2, "maxsize=\"1.2em\" minsize=\"1.2em\"");
  }
  | BBIG MOFS {
    $$ = newTag("mo", $2, "maxsize=\"1.8em\" minsize=\"1.8em\"");
  } 
  | BIGG MOFS {
    $$ = newTag("mo", $2, "maxsize=\"2.4em\" minsize=\"2.4em\"");
  }
  | BBIGG MOFS {
    $$ = newTag("mo", $2, "maxsize=\"3em\" minsize=\"3em\"");
  }
  | BIGL MOFS {
    $$ = newTag("mo", $2, "maxsize=\"1.2em\" minsize=\"1.2em\"");
  }
  | BBIGL MOFS {
    $$ = newTag("mo", $2, "maxsize=\"1.8em\" minsize=\"1.8em\"");
  }
  | BIGGL MOFS {
    $$ = newTag("mo", $2, "maxsize=\"2.4em\" minsize=\"2.4em\"");
  }
  | BBIGGL MOFS {
    $$ = newTag("mo", $2, "maxsize=\"3em\" minsize=\"3em\"");
  }
  | left expressionList right {
    $$ = newTag("mrow", $1 + newMrow($2.list) + $3);
  }
  | "{" expressionList TEXATOP expressionList "}" {
    $$ = newTag("mfrac", newMrow($2.list) + newMrow($4.list),
                "linethickness=\"0\"");
  }
  | left expressionList TEXATOP expressionList right {
    $$ = newTag("mfrac", newMrow($2.list) + newMrow($4.list),
                "linethickness=\"0\"");
    $$ = newTag("mrow", $1 + $$ + $3);
  }
  | "{" expressionList TEXOVER expressionList "}" {
    $$ = newTag("mfrac", newMrow($2.list) + newMrow($4.list));
  }
  | left expressionList TEXOVER expressionList right {
    $$ = newTag("mfrac", newMrow($2.list) + newMrow($4.list));
    $$ = newTag("mrow", $1 + $$ + $3);
  }
  | "{" expressionList TEXCHOOSE expressionList "}" {
    $$ = newTag("mfrac", newMrow($2.list) + newMrow($4.list),
                "linethickness=\"0\"");
    $$ = newTag("mrow", newMo("(") + $$ + newMo(")"));
  }
  | left expressionList TEXCHOOSE expressionList right {
    $$ = newTag("mfrac", newMrow($2.list) + newMrow($4.list),
                "linethickness=\"0\"");
    $$ = newTag("mrow", $1 + $$ + $3);
    $$ = newTag("mrow", newMo("(") + $$ + newMo(")"));
  }
  | NUM { $$ = newTag("mn", $1); }
  | TEXT { $$ = newTag("mtext", $1); }
  | A { $$ = newTag("mi", $1); }
  | F { $$ = newTag("mi", $1); }
  | MI tokenContent { $$ = newTag("mi", $2); }
  | MN tokenContent { $$ = newTag("mn", $2); }
  | MO tokenContent { $$ = newMo($2); }
  | "." { $$ = newMo($1); }
  | MOA { $$ = newMo($1); }
  | MOAS { $$ = newTag("mo", $1, "stretchy=\"false\""); }
  | MOFS { $$ = newTag("mo", $1, "stretchy=\"false\""); }
  | MOS tokenContent { $$ = newTag("mo", $2, "stretchy=\"false\""); }
  | MS tokenContent { $$ = newTag("ms", $2); }
  | MS textOptArg textOptArg tokenContent {
     $$ = newTag("ms", $4, "lquote=\"" + escapeQuote($2) +
                           "\" rquote=\"" + escapeQuote($3) + "\"");
  }
  | MTEXT tokenContent { $$ = newTag("mtext", $2); }
  | UNKNOWN_TEXT { $$ = newTag("mtext", escapeText($1)); }
  | OPERATORNAME textArg {
    $$ = newTag("mo", $2, "lspace=\"0em\" rspace=\"thinmathspace\"");
  }
  | MATHOP textArg {
    $$ = newTag("mo", $2,
                "lspace=\"thinmathspace\" rspace=\"thinmathspace\"");
  }
  | MATHBIN textArg {
    $$ = newTag("mo", $2,
                "lspace=\"mediummathspace\" rspace=\"mediummathspace\"");
  }
  | MATHREL textArg {
    $$ = newTag("mo", $2,
                "lspace=\"thickmathspace\" rspace=\"thickmathspace\"");
  }
  | NEGSPACE { $$ = "<mspace width=\"negativethinmathspace\">"; }
  | THINSPACE { $$ = "<mspace width=\"thinmathspace\"/>"; }
  | MEDSPACE { $$ = "<mspace width=\"mediummathspace\"/>"; }
  | THICKSPACE { $$ = "<mspace width=\"thickmathspace\"/>"; }
  | FRAC closedTerm closedTerm { $$ = newTag("mfrac", $2 + $3); }
  | ROOT closedTerm closedTerm { $$ = newTag("mroot", $3 + $2); }
  | SQRT closedTerm { $$ = newTag("msqrt", $2); }
  | SQRT "[" expressionList "]" closedTerm {
    $$ = newTag("mroot", $5 + newMrow($3.list));
  }
  | UNDERSET closedTerm closedTerm { $$ = newTag("munder", $3 + $2); }
  | OVERSET closedTerm closedTerm { $$ = newTag("mover", $3 + $2); }
  | UNDEROVERSET closedTerm closedTerm closedTerm {
    $$ = newTag("munderover", $4 + $2 + $3); }
  }
  | MATHRLAP closedTerm { $$ = newTag("mpadded", $2, "width=\"0em\""); }
  | MATHLLAP closedTerm {
    $$ = newTag("mpadded", $2, "width=\"0em\" lspace=\"-100%width\"");
  }
  | MATHCLAP closedTerm {
    $$ = newTag("mpadded", $2, "width=\"0em\" lspace=\"-50%width\"");
  }
  | PHANTOM closedTerm { $$ = newTag("mphantom", $2); }
  | TFRAC closedTerm closedTerm {
    $$ = newTag("mfrac", $2 + $3);
    $$ = newTag("mstyle", $$, "displaystyle=\"false\"");
  }
  | BINOM closedTerm closedTerm {
    $$ = newTag("mfrac", $2 + $3, "linethickness=\"0\"");
    $$ = newTag("mrow", newMo("(") + $$ + newMo(")"));
  }
  | TBINOM closedTerm closedTerm {
    $$ = newTag("mfrac", $2 + $3, "linethickness=\"0\"");
    $$ = newTag("mstyle", $$, "displaystyle=\"false\"");
    $$ = newTag("mrow", newMo("(") + $$ + newMo(")"));
  }
  | UNDERBRACE closedTerm { $$ = newTag("munder", $2 + newMo("\u23DF")); }
  | UNDERLINE closedTerm { $$ = newTag("munder", $2 + newMo("_")); }
  | OVERBRACE closedTerm { $$ = newTag("mover", $2 + newMo("\u23DE")); }
  | ACCENT closedTerm {
    $$ = newTag("mover", $2 + newMo($1));
  }
  | ACCENTNS closedTerm {
    $$ = newTag("mover", $2 + newTag("mo", $1, "stretchy=\"false\""));
  }
  | QUAD { $$ = "<mspace width=\"1em\"/>"; }
  | QQUAD { $$ = "<mspace width=\"2em\"/>"; }
  | BOXED closedTerm { $$ = newTag("menclose", $2, "notation=\"box\""); }
  | SLASH closedTerm {
    $$ = newTag("menclose", $2, "notation=\"updiagonalstrike\"");
  }
  | MATHBB closedTerm {
    $$ = newTag("mstyle", $2, "mathvariant=\"double-struck\"");
  }
  | MATHBF closedTerm { $$ = newTag("mstyle", $2, "mathvariant=\"bold\""); }
  | MATHBIT closedTerm { $$ = newTag("mstyle", $2,
                                     "mathvariant=\"bold-italic\""); }
  | MATHSRC closedTerm { $$ = newTag("mstyle", $2, "mathvariant=\"script\""); }
  | MATHBSRC closedTerm {
    $$ = newTag("mstyle", $2, "mathvariant=\"bold-script\"");
  }
  | MATHSF closedTerm {
    $$ = newTag("mstyle", $2, "mathvariant=\"sans-serif\"");
  }
  | MATHFRAK closedTerm {
    $$ = newTag("mstyle", $2, "mathvariant=\"fraktur\"");
  }
  | MATHIT closedTerm { $$ = newTag("mstyle", $2, "mathvariant=\"italic\""); }
  | MATHTT closedTerm { $$ = newTag("mstyle", $2, "mathvariant=\"monospace\""); }
  | MATHRM closedTerm { $$ = newTag("mstyle", $2, "mathvariant=\"normal\""); }
  | HREF textArg closedTerm {
    $$ = newTag("mrow", $3, "href=\"" + escapeQuote($2) + "\"");
  }
  | TENSOR closedTerm "{" subsupList "}" {
    $$ = newTag("mmultiscripts", $2, $4);
  }
  | MULTI "{" subsupList "}" closedTerm "{" subsupList "}" {
    $$ = newTag("mmultiscripts", $5 + $7 + "<mprescripts/>" + $3);
  }
  | BMATRIX tableRowList EMATRIX {
    $$ = newTag("mtable", $2, "rowspacing=\"0.5ex\"");
  }
  | BGATHERED tableRowList EGATHERED {
    $$ = newTag("mtable", $2, "rowspacing=\"1.0ex\"");
  }
  | BPMATRIX tableRowList EPMATRIX {
    $$ = newTag("mtable", $2, "rowspacing=\"0.5ex\"");
    $$ = newTag("mrow", newMo("(") + $$ + newMo(")"));
  }
  | BBMATRIX tableRowList EBMATRIX {
    $$ = newTag("mtable", $2, "rowspacing=\"0.5ex\"");
    $$ = newTag("mrow", newMo("[") + $$ + newMo("]"));
  }
  | BVMATRIX tableRowList EVMATRIX {
    $$ = newTag("mtable", $2, "rowspacing=\"0.5ex\"");
    $$ = newTag("mrow", newMo("|") + $$ + newMo("|"));
  }
  | BBBVMATRIX tableRowList EBBMATRIX {
    $$ = newTag("mtable", $2, "rowspacing=\"0.5ex\"");
    $$ = newTag("mrow", newMo("{") + $$ + newMo("}"));
  }
  | BVVVMATRIX tableRowList EVVMATRIX {
    $$ = newTag("mtable", $2, "rowspacing=\"0.5ex\"");
    $$ = newTag("mrow", newMo("\u2016") + $$ + newMo("\u2016"));
  }
  | BSMALLMATRIX tableRowList ESMALLMATRIX {
    $$ = newTag("mtable", $2, "rowspacing=\"0.5ex\"");
    $$ = newTag("mstyle", $$, "scriptlevel=\"2\"");
  }
  | BCASES tableRowList ECASES {
    $$ = newTag("mtable", $2, "columnalign=\"left left\"");
    $$ = newTag("mrow", newMo("{") + $$);
  }
  | BALIGNED tableRowList EALIGNED {
    $$ = newTag("mtable", $2, "columnalign=\"right left right left right left right left right left\" columnspacing=\"0em\"");
  }
  | SUBSTACK "{" tableRowList "}" {
    $$ = newTag("mtable", $3, "columnalign=\"center\" rowspacing=\"0.5ex\"");
  }
  ;

left
  : LEFT MOFS {
    $$ = newMo($2);
  }
  | LEFT "." {
    $$ = "";
  }
  ;

right
  : RIGHT MOFS {
    $$ = newMo($2);
  }
  | RIGHT "." {
    $$ = "";
  }
  ;

scriptedTerm
  : closedTerm "_" closedTerm "^" closedTerm {
    $$ = newScript(false, $1, $3, $5);
  }
  | closedTerm "^" closedTerm "_" closedTerm {
    $$ = newScript(false, $1, $5, $3);
  }
  | closedTerm "_" closedTerm {
    $$ = newScript(false, $1, $3, null);
  }
  | closedTerm "^" closedTerm {
    $$ = newScript(false, $1, null, $3);
  }
  | closedTerm { $$ = $1; }
  ;

scriptedTermList
  : scriptedTerm { $$ = [$1]; }
  | scriptedTermList scriptedTerm { $1.push($2); $$ = $1; }
  ;

expressionList
  : textstyle expressionList {
    $$ = newIsolated(0, newTag("mstyle", newMrow($2.list), $1));
  }

  | scriptedTermList { $$ = newIsolated(1000, newMrow($1)); }

  | expressionList MOINF30 expressionList {
    $$ = newBinary(30, $1, newMo($2), $3);
  }
  | expressionList MOINF30 {
    $$ = newPostfixUnary(30, $1, newMo($2));
  } 
  | MOINF30 { $$ = newIsolated(30, newMo($1)); }

  | expressionList MOINF40 expressionList {
    $$ = newBinary(40, $1, newMo($2), $3);
  }
  | expressionList MOINF40 {
    $$ = newPostfixUnary(40, $1, newMo($2));
  } 
  | MOINF40 { $$ = newIsolated(40, newMo($1)); }

  | expressionList MOINF70 expressionList {
    $$ = newBinary(70, $1, newMo($2), $3);
  }
  | MOINF70 { $$ = newIsolated(70, newMo($1)); }

  | expressionList MOINF100 expressionList {
    $$ = newBinary(100, $1, newMo($2), $3);
  }
  | MOINF100 { $$ = newIsolated(100, newMo($1)); }

  | expressionList MOPOS100 {
    $$ = newPostfixUnary(100, $1, newMo($2));
  }
  | MOPOS100 {
    $$ = newIsolated(100, newMo($1));
  }

  | expressionList MOINF110 expressionList {
    $$ = newBinary(110, $1, newMo($2), $3);
  }
  | MOINF110 { $$ = newIsolated(110, newMo($1)); }

  | expressionList MOINF150 expressionList {
    $$ = newBinary(150, $1, newMo($2), $3);
  }
  | MOINF150 { $$ = newIsolated(150, newMo($1)); }

  | expressionList MOINF160 expressionList {
    $$ = newBinary(160, $1, newMo($2), $3);
  }
  | MOINF160 { $$ = newIsolated(160, newMo($1)); }

  | expressionList MOINF170 expressionList {
    $$ = newBinary(170, $1, newMo($2), $3);
  }
  | MOINF170 { $$ = newIsolated(170, newMo($1)); }

  | expressionList MOINF190 expressionList {
    $$ = newBinary(190, $1, newMo($2), $3);
  }
  | MOINF190 { $$ = newIsolated(190, newMo($1)); }

  | expressionList MOINF200 expressionList {
    $$ = newBinary(200, $1, newMo($2), $3);
  }
  | MOINF200 { $$ = newIsolated(200, newMo($1)); }

  | MOPRE230 expressionList { $$ = newUnary(230, newMo($1), $2); }
  | MOPRE230 { $$ = newIsolated(230, newMo($1)); }

  | expressionList MOINF240 expressionList {
    $$ = newBinary(240, $1, newMo($2), $3);
  }
  | MOINF240 { $$ = newIsolated(240, newMo($1)); }

  | expressionList MOINF241 expressionList {
    $$ = newBinary(241, $1, newMo($2), $3);
  }
  | MOINF241 { $$ = newIsolated(241, newMo($1)); }

  | expressionList MOINF242 expressionList {
    $$ = newBinary(242, $1, newMo($2), $3);
  }
  | MOINF242 { $$ = newIsolated(242, newMo($1)); }

  | expressionList MOINF243 expressionList {
    $$ = newBinary(243, $1, newMo($2), $3);
  }
  | MOINF243 { $$ = newIsolated(243, newMo($1)); }

  | expressionList MOINF244 expressionList {
    $$ = newBinary(244, $1, newMo($2), $3);
  }
  | MOINF244 { $$ = newIsolated(244, newMo($1)); }

  | expressionList MOINF245 expressionList {
    $$ = newBinary(245, $1, newMo($2), $3);
  }
  | MOINF245 { $$ = newIsolated(245, newMo($1)); }

  | expressionList MOINF246 expressionList {
    $$ = newBinary(246, $1, newMo($2), $3);
  }
  | MOINF246 { $$ = newIsolated(246, newMo($1)); }

  | expressionList MOINF247 expressionList {
    $$ = newBinary(247, $1, newMo($2), $3);
  }
  | MOINF247 { $$ = newIsolated(247, newMo($1)); }

  | expressionList MOINF250 expressionList {
    $$ = newBinary(250, $1, newMo($2), $3);
  }
  | MOINF250 { $$ = newIsolated(250, newMo($1)); }

  | expressionList MOINF252 expressionList {
    $$ = newBinary(252, $1, newMo($2), $3);
  }
  | MOINF252 { $$ = newIsolated(252, newMo($1)); }

  | expressionList MOINF255 expressionList {
    $$ = newBinary(255, $1, newMo($2), $3);
  }
  | MOINF255 { $$ = newIsolated(255, newMo($1)); }

  | expressionList MOINF260 expressionList {
    $$ = newBinary(260, $1, newMo($2), $3);
  }
  | MOINF260 expressionList {
    $$ = newUnary(260, newMo($1), $2);
  }
  | MOINF260 { $$ = newIsolated(260, newMo($1)); }

  | expressionList MOINF265 expressionList {
    $$ = newBinary(265, $1, newMo($2), $3);
  }
  | MOINF265 { $$ = newIsolated(265, newMo($1)); }

  | expressionList MOSINF265 expressionList {
    $$ = newBinary(265, $1, newTag("mo", $2, "stretchy=\"false\""), $3);
  }
  | MOSINF265 {
    $$ = newIsolated(265, newTag("mo", $2, "stretchy=\"false\""));
  }

  | expressionList MOINF270 expressionList {
    $$ = newBinary(270, $1, newMo($2), $3);
  }
  | MOINF270 { $$ = newIsolated(270, newMo($1)); }

  | expressionList MOSINF270 expressionList {
    $$ = newBinary(270, $1, newTag("mo", $2, "stretchy=\"false\""), $3);
  }
  | MOSINF270 {
    $$ = newIsolated(270, newTag("mo", $2, "stretchy=\"false\""));
  }

  | expressionList MOINF275 expressionList {
    $$ = newBinary(275, $1, newMo($2), $3);
  }
  | MOINF275 { $$ = newIsolated(275, newMo($1)); }

  | MOINFPRE275 expressionList %prec MOINFPRE275_PRE {
    /* increase priority, so that -1+-1 will produce {{-1}+{-1}} */
    $$ = newUnary(276, newMo($1), $2);
  }
  | expressionList MOINFPRE275 expressionList {
    $$ = newBinary(275, $1, newMo($2), $3);
  }
  | MOINFPRE275 { $$ = newIsolated(275, newMo($1)); }

  | mo290 expressionList { $$ = newUnary(290, $1, $2); }
  | mo290 { $$ = newIsolated(290, $1); }

  | expressionList MOINF300 expressionList {
    $$ = newBinary(300, $1, newMo($2), $3);
  }
  | MOINF300 { $$ = newIsolated(300, newMo($1)); }

  | mo300 expressionList { $$ = newUnary(300, $1, $2); }
  | mo300 { $$ = newIsolated(300, $1); }

  | mo310 expressionList { $$ = newUnary(310, $1, $2); }
  | mo310 { $$ = newIsolated(310, $1); }

  | mo320 expressionList { $$ = newUnary(320, $1, $2); }
  | mo320 { $$ = newIsolated(320, $1); }

  | mo330 expressionList { $$ = newUnary(330, $1, $2); }
  | mo330 { $$ = newIsolated(330, $1); }

  | expressionList MOINF340 expressionList {
    $$ = newBinary(340, $1, newMo($2), $3);
  }
  | MOINF340 { $$ = newIsolated(340, newMo($1)); }

  | expressionList MOINF350 expressionList {
    $$ = newBinary(350, $1, newMo($2), $3);
  }
  | MOINF350 { $$ = newIsolated(350, newMo($1)); }

  | mo350 expressionList { $$ = newUnary(350, $1, $2); }
  | mo350 { $$ = newIsolated(350, $1); }

  | expressionList MOINF390 expressionList {
    $$ = newBinary(390, $1, newMo($2), $3);
  }
  | MOINF390 { $$ = newIsolated(390, newMo($1)); }

  | expressionList MOINF400 expressionList {
    $$ = newBinary(400, $1, newMo($2), $3);
  }
  | MOINF400 { $$ = newIsolated(400, newMo($1)); }

  | expressionList MOINF410 expressionList {
    $$ = newBinary(410, $1, newMo($2), $3);
  }
  | MOINF410 { $$ = newIsolated(410, newMo($1)); }

  | expressionList MOINF640 expressionList {
    $$ = newBinary(640, $1, newMo($2), $3);
  }
  | MOINF640 { $$ = newIsolated(640, newMo($1)); }

  | expressionList MOINF650 expressionList {
    $$ = newBinary(650, $1, newMo($2), $3);
  }
  | MOINF650 { $$ = newIsolated(650, newMo($1)); }

  | expressionList MOINF660 expressionList {
    $$ = newBinary(660, $1, newMo($2), $3);
  }
  | MOINF660 { $$ = newIsolated(660, newMo($1)); }

  | MOPRE670 expressionList { $$ = newUnary(670, newMo($1), $2); }
  | MOPRE670 { $$ = newIsolated(670, newMo($1)); }

  | MOPRE680 expressionList { $$ = newUnary(680, newMo($1), $2); }
  | MOPRE680 { $$ = newIsolated(680, newMo($1)); }

  | expressionList MOINF710 expressionList {
    $$ = newBinary(710, $1, newMo($2), $3);
  }
  | MOINF710 { $$ = newIsolated(710, newMo($1)); }

  | MOPRE740 expressionList { $$ = newUnary(740, newMo($1), $2); }
  | MOPRE740 { $$ = newIsolated(740, newMo($1)); }

  | expressionList MOPOS800 {
    $$ = newPostfixUnary(800, $1, newMo($2));
  }
  | MOPOS800 {
    $$ = newIsolated(800, newMo($1));
  }

  | expressionList MOPOS810 {
    $$ = newPostfixUnary(810, $1, newMo($2));
  }
  | MOPOS810 {
    $$ = newIsolated(810, newMo($1));
  }

  | expressionList MOINF825 expressionList {
    $$ = newBinary(825, $1, newMo($2), $3);
  }
  | MOINF825 { $$ = newIsolated(825, newMo($1)); }

  | expressionList MOINF835 expressionList {
    $$ = newBinary(835, $1, newMo($2), $3);
  }
  | MOINF835 { $$ = newIsolated(835, newMo($1)); }

  | MOPRE845 expressionList { $$ = newUnary(845, newMo($1), $2); }
  | MOPRE845 { $$ = newIsolated(845, newMo($1)); }

  | MOSPRE845 expressionList {
    $$ = newUnary(M845, newTag("mo", $1, "stretchy=\"false\""), $2);
  }
  | MOSPRE845 {
    $$ = newIsolated(M845, newTag("mo", $1, "stretchy=\"false\""));
  }

  | expressionList MOINF850 expressionList {
    $$ = newBinary(850, $1, newMo($2), $3);
  }
  | MOINF850 { $$ = newIsolated(850, newMo($1)); }

  | expressionList MOINF880 expressionList {
    $$ = newBinary(880, $1, newMo($2), $3);
  }
  | MOINF880 { $$ = newIsolated(880, newMo($1)); }

  | expressionList MOPOS880 {
    $$ = newPostfixUnary(880, $1, newMo($2));
  }
  | MOPOS880 {
    $$ = newIsolated(880, newMo($1));
  }
  ;

textstyle
  : DISPLAYSTYLE { $$ = "displaystyle=\"true\""; }
  | TEXTSTYLE { $$ = "displaystyle=\"false\""; }
  | TEXTSIZE { $$ = "scriptlevel=\"0\""; }
  | SCRIPTSIZE { $$ = "scriptlevel=\"1\""; }
  | SCRIPTSCRIPTSIZE { $$ = "scriptlevel=\"2\""; }
  | COLOR textArg { $$ = "mathcolor=\"" + escapeQuote($2) + "\""; }
  | BGCOLOR textArg { $$ = "mathbackground=\"" + escapeQuote($2) + "\""; }
  ;

mo290
  : MOLM290 "_" closedTerm "^" closedTerm {
    $$ = newScript(true, newMo($1), $3, $5);
  }
  | MOLM290 "^" closedTerm "_" closedTerm {
    $$ = newScript(true, newMo($1), $5, $3);
  }
  | MOLM290 "_" closedTerm {
    $$ = newScript(true, newMo($1), $3, null);
  }
  | MOLM290 "^" closedTerm {
    $$ = newScript(true, newMo($1), null, $3);
  }
  | MOLM290 { $$ = newMo($1); }
  | MOL290 "_" closedTerm "^" closedTerm {
    $$ = newScript(false, newMo($1), $3, $5);
  }
  | MOL290 "^" closedTerm "_" closedTerm {
    $$ = newScript(false, newMo($1), $5, $3);
  }
  | MOL290 "_" closedTerm {
    $$ = newScript(false, newMo($1), $3, null);
  }
  | MOL290 "^" closedTerm {
    $$ = newScript(false, newMo($1), null, $3);
  }
  | MOL290 { $$ = newMo($1); }
  ;

mo300
  : MOLM300 "_" closedTerm "^" closedTerm {
    $$ = newScript(true, newMo($1), $3, $5);
  }
  | MOLM300 "^" closedTerm "_" closedTerm {
    $$ = newScript(true, newMo($1), $5, $3);
  }
  | MOLM300 "_" closedTerm {
    $$ = newScript(true, newMo($1), $3, null);
  }
  | MOLM300 "^" closedTerm {
    $$ = newScript(true, newMo($1), null, $3);
  }
  | MOLM300 { $$ = newMo($1); }
  | MOL300 "_" closedTerm "^" closedTerm {
    $$ = newScript(false, newMo($1), $3, $5);
  }
  | MOL300 "^" closedTerm "_" closedTerm {
    $$ = newScript(false, newMo($1), $5, $3);
  }
  | MOL300 "_" closedTerm {
    $$ = newScript(false, newMo($1), $3, null);
  }
  | MOL300 "^" closedTerm {
    $$ = newScript(false, newMo($1), null, $3);
  }
  | MOL300 { $$ = newMo($1); }
  ;

mo310
  : MOLM310 "_" closedTerm "^" closedTerm {
    $$ = newScript(true, newMo($1), $3, $5);
  }
  | MOLM310 "^" closedTerm "_" closedTerm {
    $$ = newScript(true, newMo($1), $5, $3);
  }
  | MOLM310 "_" closedTerm {
    $$ = newScript(true, newMo($1), $3, null);
  }
  | MOLM310 "^" closedTerm {
    $$ = newScript(true, newMo($1), null, $3);
  }
  | MOLM310 { $$ = newMo($1); }
  | MOL310 "_" closedTerm "^" closedTerm {
    $$ = newScript(false, newMo($1), $3, $5);
  }
  | MOL310 "^" closedTerm "_" closedTerm {
    $$ = newScript(false, newMo($1), $5, $3);
  }
  | MOL310 "_" closedTerm {
    $$ = newScript(false, newMo($1), $3, null);
  }
  | MOL310 "^" closedTerm {
    $$ = newScript(false, newMo($1), null, $3);
  }
  | MOL310 { $$ = newMo($1); }
  ;

mo320
  : MOLM320 "_" closedTerm "^" closedTerm {
    $$ = newScript(true, newMo($1), $3, $5);
  }
  | MOLM320 "^" closedTerm "_" closedTerm {
    $$ = newScript(true, newMo($1), $5, $3);
  }
  | MOLM320 "_" closedTerm {
    $$ = newScript(true, newMo($1), $3, null);
  }
  | MOLM320 "^" closedTerm {
    $$ = newScript(true, newMo($1), null, $3);
  }
  | MOLM320 { $$ = newMo($1); }
  ;

mo330
  : MOLM330 "_" closedTerm "^" closedTerm {
    $$ = newScript(true, newMo($1), $3, $5);
  }
  | MOLM330 "^" closedTerm "_" closedTerm {
    $$ = newScript(true, newMo($1), $5, $3);
  }
  | MOLM330 "_" closedTerm {
    $$ = newScript(true, newMo($1), $3, null);
  }
  | MOLM330 "^" closedTerm {
    $$ = newScript(true, newMo($1), null, $3);
  }
  | MOLM330 { $$ = newMo($1); }
  ;

mo350
  : MOLM350 "_" closedTerm "^" closedTerm {
    $$ = newScript(true, newMo($1), $3, $5);
  }
  | MOLM350 "^" closedTerm "_" closedTerm {
    $$ = newScript(true, newMo($1), $5, $3);
  }
  | MOLM350 "_" closedTerm {
    $$ = newScript(true, newMo($1), $3, null);
  }
  | MOLM350 "^" closedTerm {
    $$ = newScript(true, newMo($1), null, $3);
  }
  | MOLM350 { $$ = newMo($1); }
  ;

tableRowList
  : tableRow { $$ = $1; }
  | tableRowList ROWSEP tableRow { $$ = $1 + $3 }
  ;

tableRow
  : simpleTableRow { $$ = newTag("mtr", $1); }
  ;

simpleTableRow
  : tableCell { $$ = $1; }
  | simpleTableRow COLSEP tableCell { $$ = $1 + $3; }
  ;

tableCell
  : { $$ = newTag("mtd", ""); }
  | expressionList { $$ = newMrow($1.list, "mtd"); }
  ;

subsupList
  : subsupTerm { $$ = $1; }
  | subsupList subsupTerm { $$ = $1 + $2 }
  ;

subsupTerm
  : "_" subsupTermScript "^" subsupTermScript { $$ = $2 + $4; }
  | "_" subsupTermScript { $$ = $2 + "<none/>"; }
  | "^" subsupTermScript { $$ = "<none/>" + $2; }
  | "_" "^" subsupTermScript { $$ = "<none/>" + $3; }
  ;

subsupTermScript
  : closedTerm { $$ = $1; }
  | MOLM290 { $$ = newMo($1); }
  | MOL290 { $$ = newMo($1); }
  | MOLM300 { $$ = newMo($1); }
  | MOL300 { $$ = newMo($1); }
  | MOLM310 { $$ = newMo($1); }
  | MOL310 { $$ = newMo($1); }
  | MOLM320 { $$ = newMo($1); }
  | MOLM330 { $$ = newMo($1); }
  | MOLM350 { $$ = newMo($1); }
  ;
