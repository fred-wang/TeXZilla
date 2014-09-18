#!gmake
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#

from __future__ import print_function
import argparse
import re
import sys

def customMathClass(aCodePoint):

    # We define/redefine some mathclass that are absent from unicode.xml or
    # that are different from what itex2MML does.

    if len(aCodePoint) == 1:
        if (aCodePoint[0] == 0x221E):
            return "NUM"
        elif (aCodePoint[0] in
              [0x0024, 0x0025, 0x0026, 0x00F0, 0x03C2, 0x210F, 0x2127, 0x2205]):
            return "A"
        elif (aCodePoint[0] in [0x0023, 0x2020, 0x2021, 0x214B,
                                0x2305, 0x2306, 0x2322, 0x2323, 0x23B0, 0x23B1,
                                0x25CA, 0x25CB,
                                0x2605, 0x2660, 0x2661, 0x2662, 0x2663,
                                0x27F2, 0x27F3]):
            return "OP"
        elif (aCodePoint[0] in [0x2032, 0x2033, 0x2034, 0x2035, 0x2057]):
            return "OPP"

    if len(aCodePoint) == 2:
        if ((aCodePoint[0] == 0x003D and aCodePoint[1] == 0x2237) or
            (aCodePoint[0] == 0x2268 and aCodePoint[1] == 0xFE00) or
            (aCodePoint[0] == 0x2269 and aCodePoint[1] == 0xFE00) or
            (aCodePoint[0] == 0x228A and aCodePoint[1] == 0xFE00) or
            (aCodePoint[0] == 0x228B and aCodePoint[1] == 0xFE00) or
            (aCodePoint[0] == 0x2ACB and aCodePoint[1] == 0xFE00) or
            (aCodePoint[0] == 0x2ACC and aCodePoint[1] == 0xFE00)):
            return "OP"

    return None

def isLaTeXCharacterCommand(aCommand):

    # We exclude commands that do not generate a single character.
    if (command == "\\overbrace" or
        command == "\\underbrace" or
        command == "\\hat"):
        return False

    return True

def addLaTeXCommands(aCodePoint, aLaTeXCommands):

    # We add some LaTeX commands defined in itex2MML

    if len(aCodePoint) == 1:
        if aCodePoint[0] == 0x0023:
            aLaTeXCommands.append("\\#")
        if aCodePoint[0] == 0x0024:
            aLaTeXCommands.append("\\$")
        if aCodePoint[0] == 0x0025:
            aLaTeXCommands.append("\\%")
        elif aCodePoint[0] == 0x0026:
            aLaTeXCommands.append("\\&")
        elif aCodePoint[0] == 0x003C:
            aLaTeXCommands.append("\\lt")
        elif aCodePoint[0] == 0x003E:
            aLaTeXCommands.append("\\gt")
        elif aCodePoint[0] == 0x007B:
            aLaTeXCommands.append("\\{")
        elif aCodePoint[0] == 0x007D:
            aLaTeXCommands.append("\\}")
        elif aCodePoint[0] == 0x00AC:
            aLaTeXCommands.append("\\not")
        elif aCodePoint[0] == 0x00F0:
            aLaTeXCommands.append("\\eth")
        elif aCodePoint[0] == 0x0237:
            aLaTeXCommands.append("\\jmath")
        elif aCodePoint[0] == 0x0391:
            aLaTeXCommands.append("\\Alpha")
        elif aCodePoint[0] == 0x0392:
            aLaTeXCommands.append("\\Beta")
        elif aCodePoint[0] == 0x0396:
            aLaTeXCommands.append("\\Zeta")
        elif aCodePoint[0] == 0x0397:
            aLaTeXCommands.append("\\Eta")
        elif aCodePoint[0] == 0x0399:
            aLaTeXCommands.append("\\Iota")
        elif aCodePoint[0] == 0x039A:
            aLaTeXCommands.append("\\Kappa")
        elif aCodePoint[0] == 0x039C:
            aLaTeXCommands.append("\\Mu")
        elif aCodePoint[0] == 0x039D:
            aLaTeXCommands.append("\\Nu")
        elif aCodePoint[0] == 0x03A1:
            aLaTeXCommands.append("\\Rho")
        elif aCodePoint[0] == 0x03A4:
            aLaTeXCommands.append("\\Tau")
        elif aCodePoint[0] == 0x03D1:
            aLaTeXCommands.append("\\vartheta")
        elif aCodePoint[0] == 0x03D2:
            aLaTeXCommands.append("\\Upsi")
        elif aCodePoint[0] == 0x2016:
            aLaTeXCommands.append("\\|")
        elif aCodePoint[0] == 0x2022:
            aLaTeXCommands.append("\\bullet")
        elif aCodePoint[0] == 0x2026:
            aLaTeXCommands.append("\\ldots")
        elif aCodePoint[0] == 0x2032:
            aLaTeXCommands.append("'")
        elif aCodePoint[0] == 0x2033:
            aLaTeXCommands.append("''")
        elif aCodePoint[0] == 0x2034:
            aLaTeXCommands.append("'''")
        elif aCodePoint[0] == 0x2057:
            aLaTeXCommands.append("''''")
        elif aCodePoint[0] == 0x210F:
            aLaTeXCommands.append("\\hbar")
        elif aCodePoint[0] == 0x2127:
            aLaTeXCommands.append("\\mho")
        elif aCodePoint[0] == 0x2134:
            aLaTeXCommands.append("\\omicron")
        elif aCodePoint[0] == 0x214B:
            aLaTeXCommands.append("\\invamp")
            aLaTeXCommands.append("\\parr")
        elif aCodePoint[0] == 0x2192:
            aLaTeXCommands.append("\\to")
        elif aCodePoint[0] == 0x2191:
            aLaTeXCommands.append("\\uparr")
        elif aCodePoint[0] == 0x2193:
            aLaTeXCommands.append("\\darr")
        elif aCodePoint[0] == 0x2195:
            aLaTeXCommands.append("\\downuparrow")
            aLaTeXCommands.append("\\duparr")
            aLaTeXCommands.append("\\updarr")
        elif aCodePoint[0] == 0x2196:
            aLaTeXCommands.append("\\nwarr")
        elif aCodePoint[0] == 0x2197:
            aLaTeXCommands.append("\\nearr")
        elif aCodePoint[0] == 0x2198:
            aLaTeXCommands.append("\\searr")
        elif aCodePoint[0] == 0x2199:
            aLaTeXCommands.append("\\swarr")
        elif aCodePoint[0] == 0x21AA:
            aLaTeXCommands.append("\\embedsin")
        elif aCodePoint[0] == 0x21A6:
            aLaTeXCommands.append("\\map")
        elif aCodePoint[0] == 0x21D0:
            aLaTeXCommands.append("\\impliedby")
        elif aCodePoint[0] == 0x21D2:
            aLaTeXCommands.append("\\implies")
        elif aCodePoint[0] == 0x21D6:
            aLaTeXCommands.append("\\nwArrow")
            aLaTeXCommands.append("\\nwArr")
        elif aCodePoint[0] == 0x21D7:
            aLaTeXCommands.append("\\neArrow")
            aLaTeXCommands.append("\\neArr")
        elif aCodePoint[0] == 0x21D8:
            aLaTeXCommands.append("\\seArrow")
            aLaTeXCommands.append("\\seArr")
        elif aCodePoint[0] == 0x21D9:
            aLaTeXCommands.append("\\swArrow")
            aLaTeXCommands.append("\\swArr")
        elif aCodePoint[0] == 0x2205:
            aLaTeXCommands.append("\\empty")
            aLaTeXCommands.append("\\emptyset")
        elif aCodePoint[0] == 0x2207:
            aLaTeXCommands.append("\\Del")
        elif aCodePoint[0] == 0x220C:
            aLaTeXCommands.append("\\notni")
        elif aCodePoint[0] == 0x220F:
            aLaTeXCommands.append("\\product")
        elif aCodePoint[0] == 0x2210:
            aLaTeXCommands.append("\\coproduct")
        elif aCodePoint[0] == 0x2216:
            aLaTeXCommands.append("\\smallsetminus")
        elif aCodePoint[0] == 0x221D:
            aLaTeXCommands.append("\\varpropto")
        elif aCodePoint[0] == 0x221E:
            aLaTeXCommands.append("\\infinity")
        elif aCodePoint[0] == 0x2223:
            aLaTeXCommands.append("\\shortmid")
        elif aCodePoint[0] == 0x2224:
            aLaTeXCommands.append("\\nshortmid")
        elif aCodePoint[0] == 0x2225:
            aLaTeXCommands.append("\\shortparallel")
        elif aCodePoint[0] == 0x2226:
            aLaTeXCommands.append("\\nshortparallel")
        elif aCodePoint[0] == 0x2229:
            aLaTeXCommands.append("\\intersection")
        elif aCodePoint[0] == 0x222A:
            aLaTeXCommands.append("\\union")
        elif aCodePoint[0] == 0x222B:
            aLaTeXCommands.append("\\integral")
        elif aCodePoint[0] == 0x222C:
            aLaTeXCommands.append("\\doubleintegral")
        elif aCodePoint[0] == 0x222D:
            aLaTeXCommands.append("\\tripleintegral")
        elif aCodePoint[0] == 0x222E:
            aLaTeXCommands.append("\\conint")
            aLaTeXCommands.append("\\contourintegral")
        elif aCodePoint[0] == 0x2237:
            aLaTeXCommands.append("\\dblcolon")
        elif aCodePoint[0] == 0x223C:
            aLaTeXCommands.append("\\thicksim")
        elif aCodePoint[0] == 0x2248:
            aLaTeXCommands.append("\\thickapprox")
        elif aCodePoint[0] == 0x2251:
            aLaTeXCommands.append("\\doteqdot")
        elif aCodePoint[0] == 0x2254:
            aLaTeXCommands.append("\\coloneqq")
        elif aCodePoint[0] == 0x2255:
            aLaTeXCommands.append("\\eqqcolon")
        elif aCodePoint[0] == 0x2260:
            aLaTeXCommands.append("\\neq")
        elif aCodePoint[0] == 0x2264:
            aLaTeXCommands.append("\\leq")
        elif aCodePoint[0] == 0x2265:
            aLaTeXCommands.append("\\geq")
        elif aCodePoint[0] == 0x2288:
            aLaTeXCommands.append("\\nsubseteqq")
        elif aCodePoint[0] == 0x229D:
            aLaTeXCommands.append("\\odash")
        elif aCodePoint[0] == 0x229E:
            aLaTeXCommands.append("\\plusb")
        elif aCodePoint[0] == 0x229F:
            aLaTeXCommands.append("\\minusb")
        elif aCodePoint[0] == 0x22A0:
            aLaTeXCommands.append("\\timesb")
        elif aCodePoint[0] == 0x22A5:
            aLaTeXCommands.append("\\bottom")
            aLaTeXCommands.append("\\bot")
        elif aCodePoint[0] == 0x22AB:
            aLaTeXCommands.append("\\VDash")
        elif aCodePoint[0] == 0x22B2:
            aLaTeXCommands.append("\\lhd")
        elif aCodePoint[0] == 0x22B3:
            aLaTeXCommands.append("\\rhd")
        elif aCodePoint[0] == 0x22B4:
            aLaTeXCommands.append("\\unlhd")
        elif aCodePoint[0] == 0x22B5:
            aLaTeXCommands.append("\\unrhd")
        elif aCodePoint[0] == 0x22C0:
            aLaTeXCommands.append("\\Wedge")
        elif aCodePoint[0] == 0x22C1:
            aLaTeXCommands.append("\\Vee")
        elif aCodePoint[0] == 0x22C2:
            aLaTeXCommands.append("\\Intersection")
        elif aCodePoint[0] == 0x22C3:
            aLaTeXCommands.append("\\Union")
        elif aCodePoint[0] == 0x22C4:
            aLaTeXCommands.append("\\Diamond")
        elif aCodePoint[0] == 0x22D8:
            aLaTeXCommands.append("\\lll")
        elif aCodePoint[0] == 0x22F0:
            aLaTeXCommands.append("\\udots")
        elif aCodePoint[0] == 0x2306:
            aLaTeXCommands.append("\\doublebarwedge")
        elif aCodePoint[0] == 0x2322:
            aLaTeXCommands.append("\\smallfrown")
        elif aCodePoint[0] == 0x2323:
            aLaTeXCommands.append("\\smallsmile")
        elif aCodePoint[0] == 0x25A1:
            aLaTeXCommands.append("\\Box")
        elif aCodePoint[0] == 0x25AA:
            aLaTeXCommands.append("\\qed")
        elif aCodePoint[0] == 0x25B5:
            aLaTeXCommands.append("\\triangle")
        elif aCodePoint[0] == 0x27E8:
            aLaTeXCommands.append("\\lang")
            aLaTeXCommands.append("\\langle")
        elif aCodePoint[0] == 0x27E9:
            aLaTeXCommands.append("\\rang")
            aLaTeXCommands.append("\\rangle")
        elif aCodePoint[0] == 0x27EA:
            aLaTeXCommands.append("\\llangle")
        elif aCodePoint[0] == 0x27EB:
            aLaTeXCommands.append("\\rrangle")
        elif aCodePoint[0] == 0x27F2:
            aLaTeXCommands.append("\\righttoleftarrow")
        elif aCodePoint[0] == 0x27F3:
            aLaTeXCommands.append("\\lefttorightarrow")
        elif aCodePoint[0] == 0x27FA:
            aLaTeXCommands.append("\\iff")
        elif aCodePoint[0] == 0x290E:
            aLaTeXCommands.append("\\dashleftarrow")
        elif aCodePoint[0] == 0x290F:
            aLaTeXCommands.append("\\dashrightarrow")
        elif aCodePoint[0] == 0x293B:
            aLaTeXCommands.append("\\curvearrowbotright")
        elif aCodePoint[0] == 0x2A0C:
            aLaTeXCommands.append("\\quadrupleintegral")
        elif aCodePoint[0] == 0x2A2D:
            aLaTeXCommands.append("\\Oplus")
        elif aCodePoint[0] == 0x2A34:
            aLaTeXCommands.append("\\Otimes")
        elif aCodePoint[0] == 0x2A74:
            aLaTeXCommands.append("\\Coloneqq")
        elif aCodePoint[0] == 0x2AEB:
            aLaTeXCommands.append("\\Perp")
            aLaTeXCommands.append("\\Vbar")
        elif aCodePoint[0] == 0x2AFC:
            aLaTeXCommands.append("\\biginterleave")
        elif aCodePoint[0] == 0x2AFD:
            aLaTeXCommands.append("\\sslash")

    if len(aCodePoint) == 2:
        if aCodePoint[0] == 0x003D and aCodePoint[1] == 0x2237:
            aLaTeXCommands.append("\\Eqcolon")
        elif aCodePoint[0] == 0x2268 and aCodePoint[1] == 0xFE00:
            aLaTeXCommands.append("\\lvertneqq")
        elif aCodePoint[0] == 0x2269 and aCodePoint[1] == 0xFE00:
            aLaTeXCommands.append("\\gvertneqq")
        elif aCodePoint[0] == 0x228A and aCodePoint[1] == 0xFE00:
            aLaTeXCommands.append("\\varsubsetneq")
        elif aCodePoint[0] == 0x2A7D and aCodePoint[1] == 0x0338:
            aLaTeXCommands.append("\\nleqq")
        elif aCodePoint[0] == 0x2A7E and aCodePoint[1] == 0x0338:
            aLaTeXCommands.append("\\ngeqq")
        elif aCodePoint[0] == 0x2ACB and aCodePoint[1] == 0xFE00:
            aLaTeXCommands.append("\\varsubsetneqq")
        elif aCodePoint[0] == 0x2ACC and aCodePoint[1] == 0xFE00:
            aLaTeXCommands.append("\\varsupsetneqq")

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

        # Extract the mathclass, or use our custom one.
        mathclass = customMathClass(codePoint)
        if (mathclass is None):
            mathclass = info[1]

        # Extract the TeX commands for this character and add more definitions.
        LaTeXCommands = []
        for command in set(info[2:]): # use "set" to remove duplicate entries.
            if (isLaTeXCharacterCommand(command)):
                LaTeXCommands.append(command)
        addLaTeXCommands(codePoint, LaTeXCommands)

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
