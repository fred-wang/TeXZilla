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

        isSingleChar = (len(codePoint) == 1)

        # Extract the mathclass.
        mathclass = info[1]
        if (isSingleChar):
            if (codePoint[0] == 0x221E):
                # infinity
                mathclass = "NUM"
            elif (codePoint[0] == 0x24):
                # $
                mathclass = "TEXT"
            elif (codePoint[0] in [0x2032, 0x2033, 0x2034, 0x2035, 0x2057]):
                # primes
                mathclass = "OP"

        # Extract the TeX commands for this character.
        LaTeXCommands = []
        for command in set(info[2:]): # use "set" to remove duplicate entries.
            if (isValidLaTeXCommand(command)):
                LaTeXCommands.append(command)

        if isSingleChar:
            # Add the escaped version of braces.
            if codePoint[0] == 0x7B:
                LaTeXCommands.append("\\{")
            elif codePoint[0] == 0x7D:
                LaTeXCommands.append("\\}")
            elif codePoint[0] == 0x221E:
                LaTeXCommands.append("\\infinity") # itex2MML
            elif codePoint[0] == 0x2032:
                LaTeXCommands.append("'");
            elif codePoint[0] == 0x2033:
                LaTeXCommands.append("''");
            elif codePoint[0] == 0x2034:
                LaTeXCommands.append("'''");
            elif codePoint[0] == 0x2037:
                LaTeXCommands.append("''''");

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

            if isSingleChar:

                # Skip special chars: { } ^ _ & \\ % $.
                if (codePoint[0] in [0x7B, 0x7D, 0x5E, 0x5F, 0x26, 0x5C,
                                     0x25, 0x24, 0x2E]):
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
