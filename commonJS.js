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

if (typeof require !== "undefined" && typeof exports !== "undefined") {
  exports.parser = TeXZilla;
  exports.Parser = TeXZilla.Parser;

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
