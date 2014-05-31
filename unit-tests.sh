#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

TEXZILLA="$1 TeXZilla.js"
EXITCODE=0

testEqual () {
  if [ "$2" == "$3" ]; then
    echo "$1 PASS"
  else
    echo "$1 FAIL"
    EXITCODE=1
  fi;
}

testEqual "Testing parser..." "`$TEXZILLA parser 'x+y'`" '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><annotation encoding="TeX">x+y</annotation></semantics></math>'
testEqual "Testing parser (aDisplay)..." "`$TEXZILLA parser 'x+y' true`" '<math display="block" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><annotation encoding="TeX">x+y</annotation></semantics></math>'
testEqual "Testing parser (aRTL)..." "`$TEXZILLA parser 'x+y' false true`" '<math dir="rtl" xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><annotation encoding="TeX">x+y</annotation></semantics></math>'
testEqual "Testing streamfilter..." "`echo 'blah $x+y$ blah $$\\frac{1}{2}$$ blah' | $TEXZILLA streamfilter`" 'blah <math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><annotation encoding="TeX">x+y</annotation></semantics></math> blah <math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mfrac><mn>1</mn><mn>2</mn></mfrac><annotation encoding="TeX">\frac{1}{2}</annotation></semantics></math> blah'

exit $EXITCODE
