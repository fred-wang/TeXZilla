#!gmake
#
# Copyright (C) 2013-2014 Frederic Wang
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

from __future__ import print_function
import argparse
import re
import sys

def isValidLaTeXCommand(aCommand):

    if (command.find("\\") == -1 or
        command == "\\overbrace" or
        command == "\\underbrace" or
        command == "\doublebarwedge ?" or
        command == "\\hat" or
        command == "{_\\ast}" or
        command == "{{/}\\!\\!{/}}" or
        command.find("\\fontencoding") != -1 or
        command.find("\\ElsevierGlyph") != -1 or
        command.find("\\Pisymbol") != -1 or
        command.find("\\mbox") != -1):
        return False

    return True

class surrogatePair:
    def __init__(self, aHigh, aLow):
        self.high = aHigh
        self.low = aLow

def getSurrogatePair(aCodePoint):

    if ((0x0000 <= aCodePoint and aCodePoint <= 0xD7FF) or
        (0xE000 <= aCodePoint and aCodePoint <= 0xFFFF)):
        # BMP character.
        return surrogatePair(0, aCodePoint)

    if (0x10000 <= aCodePoint and aCodePoint <= 0x10FFFF):
        # Surrogate pairs
        highSurrogate = (aCodePoint - 0x10000) // 0x400 + 0xD800;
        lowSurrogate = (aCodePoint - 0x10000) % 0x400 + 0xDC00;
        return surrogatePair(highSurrogate, lowSurrogate)

    raise Exception("Invalid code point")

def getJS(aValue):
    if type(aValue) == int:
        return "\\u%04X" % aValue
    elif isinstance(aValue, surrogatePair):
        s = ""
        if aValue.high > 0:
            s += "\\u%04X" % aValue.high
        s += "\\u%04X" % aValue.low
        return s

    raise Exception("Invalid Value")

class UnicodeRange:

    def __init__(self):
        # ranges of low surrogate indexed by high surrogate
        self.lowRange = dict()

        # current surrogate range
        self.start = None
        self.end = None

    def closeLowRange(self):
        # Close the current surrogate range and save it.
        key = self.start.high
        if key in self.lowRange:
            self.lowRange[key].append((self.start.low, self.end.low))
        else:
            self.lowRange[key] = [(self.start.low, self.end.low)]

    def add(self, aCodePoint):
        surrogatePair = getSurrogatePair(aCodePoint)

        if self.start is None:
            # The container is empty, start here.
            self.start = surrogatePair
            self.end = surrogatePair
        elif (self.start.high == surrogatePair.high and
              self.end.low + 1 == surrogatePair.low):
            # Contiguous low surrogate values in the same high surrogate.
            self.end = surrogatePair
        else:
            # Close the current low surrogate high and start a new one.
            self.closeLowRange()
            self.start = surrogatePair
            self.end = surrogatePair

    def __str__(self):

        # Close the last range.
        if self.start is not None:
            self.closeLowRange()

        # Concatenate lowRanges for each high surrogate.
        s = ""
        for high in self.lowRange:
            s += "|"
            if high > 0:
                s += getJS(high)
            s += "["
            for r in self.lowRange[high]:
                s += getJS(r[0])
                if r[1] > r[0]:
                    if r[1] > r[0] + 1:
                        s += "-"
                    s += getJS(r[1])
            s += "]"
        s = s[1:]

        # Remove useless brackets around isolate values [\uXXXX].
        s = re.sub("\\[(\\\\u[0-9A-F]{4})\\]", "\\1", s)
              
        return s

if __name__ == "__main__":
    parser = argparse.ArgumentParser();
    parser.add_argument("input", nargs = "?", type=argparse.FileType('r'),
                        default = sys.stdin)
    parser.add_argument("output", nargs = "?", type=argparse.FileType('w'),
                        default = sys.stdout)
    args = parser.parse_args();

    tokenRegExp = dict()

    for line in args.input:
        info = line.split()

        # Extract the Unicode code point of the character and compute the
        # corresponding Javascript string.
        codePoint = info[0][1:].split("-");

        jsString = ""
        for i in range(0,len(codePoint)):
            codePoint[i] = int(codePoint[i], 16)
            jsString += getJS(getSurrogatePair(codePoint[i]));

        # Extract the mathclass.
        mathclass = info[1]
        if len(codePoint) == 1:
            if (codePoint[0] == 0x221E):
                # infinity
                mathclass = "NUM"
            elif (codePoint[0] == 0x0024 or codePoint[0] == 0x2205 or
                  codePoint[0] == 0x00F0 or codePoint[0] == 0x210F or
                  codePoint[0] == 0x03C2):
                # $, emptyset
                mathclass = "A"
            elif (codePoint[0] in [0x2322, 0x2323, 0x214B, 0x2661, 0x2662,
                                   0x2306, 0x2305, 0x2020, 0x2021, 0x2605,
                                   0x25CA, 0x25CB, 0x2663, 0x2660,
                                   0x23B0, 0x23B1, 0x0023]):
                mathclass = "OP"
            elif (codePoint[0] in [0x2032, 0x2033, 0x2034, 0x2035, 0x2057]):
                mathclass = "OPP"

        if len(codePoint) == 2:
            if ((codePoint[0] == 0x228A and codePoint[1] == 0xFE00) or
                (codePoint[0] == 0x2268 and codePoint[1] == 0xFE00) or
                (codePoint[0] == 0x2269 and codePoint[1] == 0xFE00) or
                (codePoint[0] == 0x228B and codePoint[1] == 0xFE00) or
                (codePoint[0] == 0x2ACB and codePoint[1] == 0xFE00)):
                mathclass = "OP"

        # Extract the TeX commands for this character.
        LaTeXCommands = []
        for command in set(info[2:]): # use "set" to remove duplicate entries.
            if (isValidLaTeXCommand(command)):
                LaTeXCommands.append(command)

        if len(codePoint) == 1:
            # Add the escaped version of braces.
            if codePoint[0] == 0x7B:
                LaTeXCommands.append("\\{")
            elif codePoint[0] == 0x7D:
                LaTeXCommands.append("\\}")
            elif codePoint[0] == 0x221E:
                LaTeXCommands.append("\\infinity") # itex2MML
            elif codePoint[0] == 0x2032:
                LaTeXCommands.append("'")
            elif codePoint[0] == 0x2033:
                LaTeXCommands.append("''")
            elif codePoint[0] == 0x2034:
                LaTeXCommands.append("'''")
            elif codePoint[0] == 0x2057:
                LaTeXCommands.append("''''")
            elif codePoint[0] == 0x2192:
                LaTeXCommands.append("\\to")
            elif codePoint[0] == 0x21A6:
                LaTeXCommands.append("\\map")
            elif codePoint[0] == 0x22A5:
                LaTeXCommands.append("\\bottom")
            elif codePoint[0] == 0x2223:
                LaTeXCommands.append("\\shortmid")
            elif codePoint[0] == 0x222B:
                LaTeXCommands.append("\\integral")
            elif codePoint[0] == 0x222C:
                LaTeXCommands.append("\\doubleintegral")
            elif codePoint[0] == 0x222D:
                LaTeXCommands.append("\\tripleintegral")
            elif codePoint[0] == 0x2A0C:
                LaTeXCommands.append("\\quadrupleintegral")
            elif codePoint[0] == 0x222E:
                LaTeXCommands.append("\\conint")
                LaTeXCommands.append("\\contourintegral")
            elif codePoint[0] == 0x229D:
                LaTeXCommands.append("\\odash")
            elif codePoint[0] == 0x2322:
                LaTeXCommands.append("\\smallfrown")
            elif codePoint[0] == 0x2323:
                LaTeXCommands.append("\\smallsmile")
            elif codePoint[0] == 0x229E:
                LaTeXCommands.append("\\plusb")
            elif codePoint[0] == 0x22A0:
                LaTeXCommands.append("\\timesb")
            elif codePoint[0] == 0x229F:
                LaTeXCommands.append("\\minusb")
            elif codePoint[0] == 0x2A34:
                LaTeXCommands.append("\\Otimes")
            elif codePoint[0] == 0x2A2D:
                LaTeXCommands.append("\\Oplus")
            elif codePoint[0] == 0x2AFC:
                LaTeXCommands.append("\\biginterleave")
            elif codePoint[0] == 0x22C0:
                LaTeXCommands.append("\\Wedge")
            elif codePoint[0] == 0x22C1:
                LaTeXCommands.append("\\Vee")
            elif codePoint[0] == 0x214B:
                LaTeXCommands.append("\\invamp")
                LaTeXCommands.append("\\parr")
            elif codePoint[0] == 0x2260:
                LaTeXCommands.append("\\neq")
            elif codePoint[0] == 0x220F:
                LaTeXCommands.append("\\product")
            elif codePoint[0] == 0x2210:
                LaTeXCommands.append("\\coproduct")
            elif codePoint[0] == 0x2AEB:
                LaTeXCommands.append("\\Perp")
                LaTeXCommands.append("\\Vbar")
            elif codePoint[0] == 0x25A1:
                LaTeXCommands.append("\\Box")
            elif codePoint[0] == 0x2205:
                LaTeXCommands.append("\\empty")
                LaTeXCommands.append("\\emptyset")
            elif codePoint[0] == 0x22B2:
                LaTeXCommands.append("\\lhd")
            elif codePoint[0] == 0x22B3:
                LaTeXCommands.append("\\rhd")
            elif codePoint[0] == 0x22D8:
                LaTeXCommands.append("\\lll")
            elif codePoint[0] == 0x22B4:
                LaTeXCommands.append("\\unlhd")
            elif codePoint[0] == 0x22B5:
                LaTeXCommands.append("\\unrhd")
            elif codePoint[0] == 0x2207:
                LaTeXCommands.append("\\Del")
            elif codePoint[0] == 0x25AA:
                LaTeXCommands.append("\\qed")
            elif codePoint[0] == 0x00F0:
                LaTeXCommands.append("\\eth")
            elif codePoint[0] == 0x0237:
                LaTeXCommands.append("\\jmath")
            elif codePoint[0] == 0x003C:
                LaTeXCommands.append("\\lt")
            elif codePoint[0] == 0x003E:
                LaTeXCommands.append("\\gt")
            elif codePoint[0] == 0x2306:
                LaTeXCommands.append("\\doublebarwedge")
            elif codePoint[0] == 0x2224:
                LaTeXCommands.append("\\nshortmid")
            elif codePoint[0] == 0x2225:
                LaTeXCommands.append("\\shortparallel")
            elif codePoint[0] == 0x2226:
                LaTeXCommands.append("\\nshortparallel")
            elif codePoint[0] == 0x220C:
                LaTeXCommands.append("\\notni")
            elif codePoint[0] == 0x2248:
                LaTeXCommands.append("\\thickapprox")
            elif codePoint[0] == 0x223C:
                LaTeXCommands.append("\\thicksim")
            elif codePoint[0] == 0x25B5:
                LaTeXCommands.append("\\triangle")
            elif codePoint[0] == 0x22C4:
                LaTeXCommands.append("\\Diamond")
            elif codePoint[0] == 0x2216:
                LaTeXCommands.append("\\smallsetminus")
            elif codePoint[0] == 0x2016:
                LaTeXCommands.append("\\|")
            elif codePoint[0] == 0x2AFD:
                LaTeXCommands.append("\\sslash")
            elif codePoint[0] == 0x27E8:
                LaTeXCommands.append("\\lang")
            elif codePoint[0] == 0x27E9:
                LaTeXCommands.append("\\rang")
            elif codePoint[0] == 0x27EA:
                LaTeXCommands.append("\\llangle")
            elif codePoint[0] == 0x27EB:
                LaTeXCommands.append("\\rrangle")
            elif codePoint[0] == 0x2254:
                LaTeXCommands.append("\\coloneqq")
            elif codePoint[0] == 0x2255:
                LaTeXCommands.append("\\eqqcolon")
            elif codePoint[0] == 0x2A74:
                LaTeXCommands.append("\\Coloneqq")

        if len(codePoint) == 2:
            if codePoint[0] == 0x228A and codePoint[1] == 0xFE00:
                LaTeXCommands.append("\\varsubsetneq")
            elif codePoint[0] == 0x2ACB and codePoint[1] == 0xFE00:
                LaTeXCommands.append("\\varsubsetneqq")
            elif codePoint[0] == 0x2268 and codePoint[1] == 0xFE00:
                LaTeXCommands.append("\\lvertneqq")
            elif codePoint[0] == 0x2269 and codePoint[1] == 0xFE00:
                LaTeXCommands.append("\\gvertneqq")

        # Escape the backslahes.
        for i in range(0,len(LaTeXCommands)):
            LaTeXCommands[i] = LaTeXCommands[i].replace("\\", "\\\\")

        if (mathclass == "A" or mathclass[:2] == "OP" or mathclass == "NUM" or
            mathclass == "TEXT"):
            token = mathclass
        else:
            token = None

        if token is not None:
            # Create rule for each LaTeX command.
            for command in LaTeXCommands:
                print("\"%s\" { yytext = \"%s\"; return \"%s\"; }" %
                      (command, jsString, token), file = args.output)

            if len(codePoint) == 1:

                # Skip special chars: { } ^ _ & \\ % $ '.
                if (codePoint[0] in [0x7B, 0x7D, 0x5E, 0x5F, 0x26, 0x5C,
                                     0x25, 0x24, 0x2E, 0x27]):
                    continue

                # If it is a single char, add it to the appropriate unicode
                # range for later printing.
                if token not in tokenRegExp:
                    tokenRegExp[token] = UnicodeRange()
                tokenRegExp[token].add(codePoint[0])
            else:
                # Otherwise, print a rule now.
                print("\"%s\" return \"%s\";" % (jsString, token),
                      file = args.output)

    # Now print a Unicode range rule for each token.
    for token in tokenRegExp:
        print("%s return \"%s\";" % (str(tokenRegExp[token]), token),
              file = args.output)

    args.input.close()
    args.output.close()
