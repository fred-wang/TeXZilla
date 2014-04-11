/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

%x DOCUMENT TRYOPTARG TEXTOPTARG TEXTARG
%s OPTARG

%%

<DOCUMENT>. return "CHAR";
<DOCUMENT><<EOF>> return "EOF";
<DOCUMENT>"$$"|"\\["|"$"|"\\(" {
  this.pushState("INITIAL");
  return "STARTMATH" + (2 * (yytext[0] == "$") + yytext.length - 1);
}

<TRYOPTARG>\s*"[" { this.popState(); return "["; }
<TRYOPTARG>. { this.unput(yytext); this.popState(); this.popState(); }

<TEXTOPTARG>([^\\\]]|(\\[\\\]]))+ { return "TEXTOPTARG"; }
<TEXTOPTARG>"]" { this.popState(); return "]"; }

<TEXTARG>\s*"{" return "{";
<TEXTARG>([^\\\}]|(\\[\\\}]))+ return "TEXTARG";
<TEXTARG>"}" { this.popState(); return "}"; }

<OPTARG>"]" { this.popState(); return "]"; }

\s+ /* skip whitespace */
"$$"|"\\]"|"$"|"\\)" {
  this.popState();
  return "ENDMATH" +  (2 * (yytext[0] == "$") + yytext.length - 1);
}
"{" return "{";
"}" return "}";
"^" return "^";
"_" return "_";
"." return ".";
"&" return "COLSEP";
"\\\\" return "ROWSEP"
<<EOF>> return "EOF";

/* Numbers */
[0-9]+(?:"."[0-9]+)?|[\u0660-\u0669]+(?:"\u066B"[\u0660-\u0669]+)?|(?:\uD835[\uDFCE-\uDFD7])+|(?:\uD835[\uDFCE-\uDFD7])+|(?:\uD835[\uDFD8-\uDFE1])+|(?:\uD835[\uDFE2-\uDFEB])+|(?:\uD835[\uDFEC-\uDFF5])+|(?:\uD835[\uDFF6-\uDFFF])+ return "NUM";
