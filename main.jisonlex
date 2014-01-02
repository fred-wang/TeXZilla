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

%x TRYOPTARG TEXTOPTARG TEXTARG 
%s OPTARG

%%

<TRYOPTARG>\s*"[" { this.popState(); return "["; }
<TRYOPTARG>. { this.unput(yytext); this.popState(); this.popState(); }

<TEXTOPTARG>([^\\\]]|(\\[\\\]]))+ { return "TEXTOPTARG"; }
<TEXTOPTARG>"]" { this.popState(); return "]"; }

<TEXTARG>\s*"{" return "{";
<TEXTARG>([^\\\}]|(\\[\\\}]))+ return "TEXTARG";
<TEXTARG>"}" { this.popState(); return "}"; }

<OPTARG>"]" { this.popState(); return "]"; }

\s+ /* skip whitespace */
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
