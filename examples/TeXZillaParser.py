# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Follow the instructions to install the SpiderMonkey module:
#
#   https://github.com/davisp/python-spidermonkey
#
# and execute this program with
#
#   python TeXZillaParser.py aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]
#

from __future__ import print_function
import sys
import spidermonkey

class TeXZillaParser:

    TEXZILLA_JS = "../TeXZilla-min.js"

    def main(self, aArgs):
        # Verify parameters.
        if len(aArgs) == 0:
            print("usage: python TeXZillaParser.py aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]")
            sys.exit(1)
        tex = aArgs[0]
        display = len(aArgs) >= 2 and aArgs[1] == "true"
        rtl = len(aArgs) >= 3 and aArgs[2] == "true"
        throwException = len(aArgs) >= 4 and aArgs[3] == "true"

        # Prepare the SpiderMonkey Javascript engine.
        rt = spidermonkey.Runtime()
        cx = rt.new_context()

        # Load TeXZilla.js and execute TeXZilla.toMathMLString with the
        # specified arguments.
        cx.execute("var window = {}")
        f = open(self.TEXZILLA_JS, "r")
        cx.execute(f.read())
        f.close()
        TeXZilla = cx.execute("window.TeXZilla")
        try:
            print(TeXZilla.toMathMLString(tex, display, rtl, throwException))
        except Exception, e:
            print(str(e))
            sys.exit(1)

if __name__ == "__main__":
    parser = TeXZillaParser()
    parser.main(sys.argv[1:])
