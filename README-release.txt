TeXZilla 0.9.9

License
-------

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.

Content
-------

- README-release.txt: This README file.
- TeXZilla.js: The TeXZilla Javascript program.
- TeXZilla-min.js: The TeXZilla.js Javascript program, without the commonJS
  interface and minified with Google Closure Compiler. For use on Web pages.
- index.html: HTML demo of TeXZilla.
- examples/: Examples of how to use TeXZilla in Web pages or commonJS programs.

Description
-----------

TeXZilla is a Javascript LaTeX-to-MathML converter compatible with Unicode. You
can use it in a commonJS program,

    var TeXZilla = require("./TeXZilla");
    console.log(TeXZilla.toMathMLString("\\sqrt{\\frac{x}{2}+y}"));

in your Web page,

    <script type="text/javascript" src="TeXZilla-min.js"></script>
    ...
    var MathMLElement = TeXZilla.toMathML("\\sqrt{\\frac{x}{2}+y}");

or from the command line (replace commonjs with your favorite JS interpreter):

commonjs TeXZilla.js parser "a^2+b^2=c^2" true
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>a</mi><mn>2</mn></msup><mo>+</mo><msup><mi>b</mi><mn>2</mn></msup><mo>=</mo><msup><mi>c</mi><mn>2</mn></msup></mrow><annotation encoding="TeX">a^2+b^2=c^2</annotation></semantics></math>

See also the index.html page and examples directory. For more details, you can
read the TeXZilla Wiki. Please report any issue to the GitHub tracker.

Links
-----

Homepage: https://github.com/fred-wang/TeXZilla
Wiki: https://github.com/fred-wang/TeXZilla/wiki
Issue Tracker: https://github.com/fred-wang/TeXZilla/issues
