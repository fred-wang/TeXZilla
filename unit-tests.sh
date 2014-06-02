#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

TEXZILLA="$1 TeXZilla.js"
CURL=$2
KILL=$3
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

if [ "$TEXZILLA" != "slimerjs TeXZilla.js" ]; then
    # slimerjs does not support streamfilter yet
    # https://github.com/fred-wang/TeXZilla/issues/35
    testEqual "Testing streamfilter..." "`echo 'blah $x+y$ blah $$\\frac{1}{2}$$ blah' | $TEXZILLA streamfilter`" 'blah <math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><annotation encoding="TeX">x+y</annotation></semantics></math> blah <math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mfrac><mn>1</mn><mn>2</mn></mfrac><annotation encoding="TeX">\frac{1}{2}</annotation></semantics></math> blah'
fi

# Testing the Web server
PORT=9999
$TEXZILLA webserver $PORT & PID=$!

sleep 1

testEqual "Testing webserver (HTTP)..." "`$CURL -H "Content-Type: application/json" -X POST -d '{"tex":"x+y","display":"true"}' http://localhost:$PORT`" '"{\"tex\":\"x+y\",\"mathml\":\"<math display=\\\"block\\\" xmlns=\\\"http://www.w3.org/1998/Math/MathML\\\"><semantics><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><annotation encoding=\\\"TeX\\\">x+y</annotation></semantics></math>\",\"exception\":null}"'

testEqual "Testing webserver (GET)..." "`curl "http://localhost:$PORT/?tex=x+y&rtl=true"`" '"{\"tex\":\"x+y\",\"mathml\":\"<math dir=\\\"rtl\\\" xmlns=\\\"http://www.w3.org/1998/Math/MathML\\\"><semantics><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><annotation encoding=\\\"TeX\\\">x+y</annotation></semantics></math>\",\"exception\":null}"'

$KILL $PID

exit $EXITCODE
