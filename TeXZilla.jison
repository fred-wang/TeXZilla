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

function parseLength(aString)
{
  // See http://www.w3.org/Math/draft-spec/appendixa.html#parsing_length
  // FIXME: should namedspaces be accepted too?
  var lengthRegexp = /\s*(-?[0-9]*(?:[0-9]\.?|\.[0-9])[0-9]*)(e[mx]|in|cm|mm|p[xtc]|%)?\s*/;
  var result = lengthRegexp.exec(aString);
  if (result) {
    result = { l: parseFloat(result[1]), u: result[2] };
  }
  return result;
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

function newMrow(aList, aTag, aAttributes)
{
  if (!aTag) {
    if (aList.length == 1) {
      /* This list only has one element so we just return it. */
      return aList[0];
    }
    aTag = "mrow";
  }
  var tag = "<" + aTag;
  if (aAttributes) tag += " " + aAttributes
  tag += ">" + aList.join("") + "</" + aTag + ">";
  return tag;
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

parser.toMathMLString = function(aTeX, aDisplay, aRTL)
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
  if (aRTL) {
    /* Set the RTL mode if specified. */
    mathml += " dir=\"rtl\""
  }
  mathml += "><semantics>" + output.source
  mathml += "<annotation encoding=\"TeX\">";
  mathml += escapeText(aTeX);
  mathml += "</annotation></semantics></math>";

  return mathml;
}

parser.toMathML = function(aTeX, aDisplay, aRTL)
{
  return parseMathMLDocument(this.toMathMLString(aTeX, aDisplay, aRTL));
}
%}

/* Operator associations and precedence. */
%left textstyle
%left TEXOVER TEXATOP TEXCHOOSE
%right "^" "_"

%start math

%% /* language grammar */

math
  : styledExpression EOF {
    $$ = { source: newMrow($1), display: false };
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

lengthOptArg
  : "[" TEXTOPTARG "]" {
    $$ = parseLength($2);
  }
  ;

lengthArg
  : "{" TEXTARG "}" {
    $$ = parseLength($2);
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
  | "{" styledExpression "}" { $$ = newMrow($2); }
  | BIG OPFS {
    $$ = newTag("mo", $2, "maxsize=\"1.2em\" minsize=\"1.2em\"");
  }
  | BBIG OPFS {
    $$ = newTag("mo", $2, "maxsize=\"1.8em\" minsize=\"1.8em\"");
  } 
  | BIGG OPFS {
    $$ = newTag("mo", $2, "maxsize=\"2.4em\" minsize=\"2.4em\"");
  }
  | BBIGG OPFS {
    $$ = newTag("mo", $2, "maxsize=\"3em\" minsize=\"3em\"");
  }
  | BIGL OPFS {
    $$ = newTag("mo", $2, "maxsize=\"1.2em\" minsize=\"1.2em\"");
  }
  | BBIGL OPFS {
    $$ = newTag("mo", $2, "maxsize=\"1.8em\" minsize=\"1.8em\"");
  }
  | BIGGL OPFS {
    $$ = newTag("mo", $2, "maxsize=\"2.4em\" minsize=\"2.4em\"");
  }
  | BBIGGL OPFS {
    $$ = newTag("mo", $2, "maxsize=\"3em\" minsize=\"3em\"");
  }
  | left styledExpression right {
    $$ = newTag("mrow", $1 + newMrow($2) + $3);
  }
  | "{" styledExpression TEXATOP styledExpression "}" {
    $$ = newTag("mfrac", newMrow($2) + newMrow($4), "linethickness=\"0\"");
  }
  | left styledExpression TEXATOP styledExpression right {
    $$ = newTag("mfrac", newMrow($2) + newMrow($4), "linethickness=\"0\"");
    $$ = newTag("mrow", $1 + $$ + $3);
  }
  | "{" styledExpression TEXOVER styledExpression "}" {
    $$ = newTag("mfrac", newMrow($2) + newMrow($4));
  }
  | left styledExpression TEXOVER styledExpression right {
    $$ = newTag("mfrac", newMrow($2) + newMrow($4));
    $$ = newTag("mrow", $1 + $$ + $3);
  }
  | "{" styledExpression TEXCHOOSE styledExpression "}" {
    $$ = newTag("mfrac", newMrow($2) + newMrow($4),
                "linethickness=\"0\"");
    $$ = newTag("mrow", newMo("(") + $$ + newMo(")"));
  }
  | left styledExpression TEXCHOOSE styledExpression right {
    $$ = newTag("mfrac", newMrow($2) + newMrow($4),
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
  | OP { $$ = newMo($1); }
  | OPAS { $$ = newTag("mo", $1, "stretchy=\"false\""); }
  | OPFS { $$ = newTag("mo", $1, "stretchy=\"false\""); }
  | OPS tokenContent { $$ = newTag("mo", $2, "stretchy=\"false\""); }
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
  | FRAC closedTerm closedTerm { $$ = newTag("mfrac", $2 + $3); }
  | ROOT closedTerm closedTerm { $$ = newTag("mroot", $3 + $2); }
  | SQRT closedTerm { $$ = newTag("msqrt", $2); }
  | SQRT "[" styledExpression "]" closedTerm {
    $$ = newTag("mroot", $5 + newMrow($3));
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
  | PMOD closedTerm {
    $$ = "<mrow><mo lspace=\"mediummathspace\">(</mo><mo rspace=\"thinmathspace\">mod</mo>" + $2 + "<mo rspace=\"mediummathspace\">)</mo></mrow>";
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
  | BOXED closedTerm { $$ = newTag("menclose", $2, "notation=\"box\""); }
  | SLASH closedTerm {
    $$ = newTag("menclose", $2, "notation=\"updiagonalstrike\"");
  }
  | QUAD { $$ = "<mspace width=\"1em\"/>"; }
  | QQUAD { $$ = "<mspace width=\"2em\"/>"; }
  | NEGSPACE { $$ = "<mspace width=\"negativethinmathspace\">"; }
  | THINSPACE { $$ = "<mspace width=\"thinmathspace\"/>"; }
  | MEDSPACE { $$ = "<mspace width=\"mediummathspace\"/>"; }
  | THICKSPACE { $$ = "<mspace width=\"thickmathspace\"/>"; }
  | SPACE textArg textArg textArg {
    $$ = "<mspace height=\"." + $2 + "ex\" depth=\"." + $3 + "ex\" " +
                  "width=\"." + $4 + "em\"/>";
  }
  | MATHRAISEBOX lengthArg lengthOptArg lengthOptArg closedTerm {
    $$ = newTag("mpadded", $5,
                "voffset=\"" + $2.l + $2.u + "\" " +
                "height=\"" + $3.l + $3.u + "\" " +
                "depth=\"" + $4.l + $4.u + "\"");
  }
  | MATHRAISEBOX lengthArg lengthOptArg closedTerm {
    $$ = newTag("mpadded", $4,
                "voffset=\"" + $2.l + $2.u + "\" " +
                "height=\"" + $3.l + $3.u + "\" depth=\"" +
                ($2.l < 0 ? "+" + (-$2.l) + $2.u : "depth") + "\"");
  }
  | MATHRAISEBOX lengthArg closedTerm {
    $$ = newTag("mpadded", $3,
                "voffset=\"" + $2.l + $2.u + "\" " +
                ($2.l >= 0 ? "height=\"+" + $2.l + $2.u + "\"" :
                 "height=\"0pt\" depth=\"+\"" + (-$2.l) + $2.u + "\""));
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
  | STATUSLINE textArg closedTerm {
    $$ = newTag("maction",
                $3 + newTag("mtext", $2), "actiontype=\"statusline\"");
  }
  | TOOLTIP textArg closedTerm {
    $$ = newTag("maction",
                $3 + newTag("mtext", $2), "actiontype=\"tooltip\"");
  }
  | TOGGLE closedTermList ENDTOGGLE {
    $$ = newTag("maction", $2, "actiontype=\"toggle\"");
  }
  | TENSOR closedTerm "{" subsupList "}" {
    $$ = newTag("mmultiscripts", $2 + $4);
  }
  | MULTI "{" subsupList "}" closedTerm "{" subsupList "}" {
    $$ = newTag("mmultiscripts", $5 + $7 + "<mprescripts/>" + $3);
  }
  | MULTI "{" subsupList "}" closedTerm "{" "}" {
    $$ = newTag("mmultiscripts", $5 + "<mprescripts/>" + $3);
  }
  | MULTI "{" "}" closedTerm "{" subsupList "}" {
    $$ = newTag("mmultiscripts", $4 + $6);
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
  : LEFT OPFS {
    $$ = newMo($2);
  }
  | LEFT "." {
    $$ = "";
  }
  ;

right
  : RIGHT OPFS {
    $$ = newMo($2);
  }
  | RIGHT "." {
    $$ = "";
  }
  ;

closedTermList
  : closedTerm {
    $$ = $1;
  }
  | closedTermList closedTerm {
    $$ = $1 + $2;
  }
  ;

compoundTerm
  : TENSOR closedTerm subsupList {
    $$ = newTag("mmultiscripts", $2 + $3);
  }
  | closedTerm "_" closedTerm "^" closedTerm {
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
  | OPM "_" closedTerm "^" closedTerm {
    $$ = newScript(true, newMo($1), $3, $5);
  }
  | OPM "^" closedTerm "_" closedTerm {
    $$ = newScript(true, newMo($1), $5, $3);
  }
  | OPM "_" closedTerm {
    $$ = newScript(true, newMo($1), $3, null);
  }
  | OPM "^" closedTerm {
    $$ = newScript(true, newMo($1), null, $3);
  }
  | OPM { $$ = newMo($1); }
  ;

compoundTermList
  : compoundTerm { $$ = [$1]; }
  | compoundTermList compoundTerm { $1.push($2); $$ = $1; }
  ;

styledExpression
  : textstyle styledExpression { $$ = [newMrow($2, "mstyle", $1)]; }
  | compoundTermList { $$ = $1; }
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
  | styledExpression { $$ = newMrow($1, "mtd"); }
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
  | OPM { $$ = newMo($1); }
  ;
