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

var parser = require("./TeXZilla").parser;
var tests = [
    /* Empty content */
    ["", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow/><annotation encoding="TeX"></annotation></semantics></math>'],
    /* single digit */
    ["1", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>1</mn><annotation encoding="TeX">1</annotation></semantics></math>'],
    /* integer */
    ["123", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>123</mn><annotation encoding="TeX">123</annotation></semantics></math>'],
    /* decimal number */
    ["01234.56789", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>01234.56789</mn><annotation encoding="TeX">01234.56789</annotation></semantics></math>'],
    /* Arabic number */
    ["١٢٣٤٫٥٦٧", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>١٢٣٤٫٥٦٧</mn><annotation encoding="TeX">١٢٣٤٫٥٦٧</annotation></semantics></math>'],
    /* single variable */
    ["x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="TeX">x</annotation></semantics></math>'],
    /* multiple variable */
    ["xyz", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mi>y</mi><mi>z</mi></mrow><annotation encoding="TeX">xyz</annotation></semantics></math>'],
    /* Arabic variables */
    ["غظضذخثتشرقصفعسنملكيطحزوهدجب", 'TODO'],
    /* variable and numbers */
    ["2xy", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi>x</mi><mi>y</mi></mrow><annotation encoding="TeX">2xy</annotation></semantics></math>'],
    /* \\mn */
    ["\\mn{TWO}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>TWO</mn><annotation encoding="TeX">\\mn{TWO}</annotation></semantics></math>'],
    /* \ms */
    ["\\ms{x}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><ms>x</ms><annotation encoding="TeX">\\ms{x}</annotation></semantics></math>'],
    /* \ms with quotes and escaped characters */
    ["\\ms[<2][&\\]x]{a&b}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><ms lquote="&lt;2" rquote="&amp;]x">a&amp;b</ms><annotation encoding="TeX">\\ms[&lt;2][&amp;\\]x]{a&amp;b}</annotation></semantics></math>'],
    /* whitespace collapse */
    ["\\mtext{  x   y  }", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>x y</mtext><annotation encoding="TeX">\\mtext{  x   y  }</annotation></semantics></math>'],
    /* escaped characters */
    ["\\mtext{2i\\}fzx\\\\}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>2i}fzx\\</mtext><annotation encoding="TeX">\\mtext{2i\\}fzx\\\\}</annotation></semantics></math>'],
    /* escaped characters */
    ["\\& \\% \\$", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>&amp;</mo><mo>%</mo><mtext>$</mtext></mrow><annotation encoding="TeX">\\&amp; \\% \\$</annotation></semantics></math>'],
    /* \frac */
    ["\\frac x y", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mfrac><mi>x</mi><mi>y</mi></mfrac><annotation encoding="TeX">\\frac x y</annotation></semantics></math>'],
    /* \sqrt */
    ["\\sqrt x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msqrt><mi>x</mi></msqrt><annotation encoding="TeX">\\sqrt x</annotation></semantics></math>'],
    /* \sqrt with optional parameter */
    ["\\sqrt[3]x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mroot><mi>x</mi><mn>3</mn></mroot><annotation encoding="TeX">\\sqrt[3]x</annotation></semantics></math>'],
    /* \sqrt nested optional arguments */
    ["\\sqrt[\\sqrt[\\frac{1}{2}]\\frac 3 4]\\frac 5 6", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mroot><mfrac><mn>5</mn><mn>6</mn></mfrac><mroot><mfrac><mn>3</mn><mn>4</mn></mfrac><mfrac><mn>1</mn><mn>2</mn></mfrac></mroot></mroot><annotation encoding="TeX">\\sqrt[\\sqrt[\\frac{1}{2}]\\frac 3 4]\\frac 5 6</annotation></semantics></math>'],
    /* \root */
    ["\\root 3 x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mroot><mi>x</mi><mn>3</mn></mroot><annotation encoding="TeX">\\root 3 x</annotation></semantics></math>'],
    /* \binom */
    ["\\binom a b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mfrac linethickness="0"><mi>a</mi><mi>b</mi></mfrac><mo>)</mo></mrow><annotation encoding="TeX">\\binom a b</annotation></semantics></math>'],
    /* \href */
    ["\\href{http://www.myurl.org}{\\frac a b}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow href="http://www.myurl.org"><mfrac><mi>a</mi><mi>b</mi></mfrac></mrow><annotation encoding="TeX">\\href{http://www.myurl.org}{\\frac a b}</annotation></semantics></math>'],
    /* isolated + */
    ["+", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mo>+</mo><annotation encoding="TeX">+</annotation></semantics></math>'],
    /* prefix + */
    ["+2", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>+</mo><mn>2</mn></mrow><annotation encoding="TeX">+2</annotation></semantics></math>'],
    /* basic addition */
    ["a+b+c", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>a</mi><mo>+</mo><mi>b</mi><mo>+</mo><mi>c</mi></mrow><annotation encoding="TeX">a+b+c</annotation></semantics></math>'],
    /* sum with more complex terms */
    ["3 + \\frac x y + \\sqrt z", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>+</mo><mfrac><mi>x</mi><mi>y</mi></mfrac><mo>+</mo><msqrt><mi>z</mi></msqrt></mrow><annotation encoding="TeX">3 + \\frac x y + \\sqrt z</annotation></semantics></math>'],
    /* operator priority and grouping */
    ["2×x+3×y×z+7×x×3", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mn>2</mn><mo>×</mo><mi>x</mi></mrow><mo>+</mo><mrow><mn>3</mn><mo>×</mo><mi>y</mi><mo>×</mo><mi>z</mi></mrow><mo>+</mo><mrow><mn>7</mn><mo>×</mo><mi>x</mi><mo>×</mo><mn>3</mn></mrow></mrow><annotation encoding="TeX">2×x+3×y×z+7×x×3</annotation></semantics></math>'],
    /* operator priority and grouping */
    ["a + b = c ; e + f = g", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow><mo>=</mo><mi>c</mi></mrow><mo>;</mo><mrow><mrow><mi>e</mi><mo>+</mo><mi>f</mi></mrow><mo>=</mo><mi>g</mi></mrow></mrow><annotation encoding="TeX">a + b = c ; e + f = g</annotation></semantics></math>'],
    /* operator priority and grouping */
    ["-1+-2+-3",'<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mo>-</mo><mn>1</mn></mrow><mo>+</mo><mrow><mo>-</mo><mn>2</mn></mrow><mo>+</mo><mrow><mo>-</mo><mn>3</mn></mrow></mrow><annotation encoding="TeX">-1+-2+-3</annotation></semantics></math>'],
    /* scripts */
    ["a_b^c + a^c_b + a_b + a^c", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>a</mi><mi>b</mi><mi>c</mi></msubsup><mo>+</mo><msubsup><mi>a</mi><mi>b</mi><mi>c</mi></msubsup><mo>+</mo><msub><mi>a</mi><mi>b</mi></msub><mo>+</mo><msup><mi>a</mi><mi>c</mi></msup></mrow><annotation encoding="TeX">a_b^c + a^c_b + a_b + a^c</annotation></semantics></math>'],
    /* Greek letters */
    ["ΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσΤτυΦφΧχΨψΩω", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Α</mi><mi>α</mi><mi>Β</mi><mi>β</mi><mi>Γ</mi><mi>γ</mi><mi>Δ</mi><mi>δ</mi><mi>Ε</mi><mi>ε</mi><mi>Ζ</mi><mi>ζ</mi><mi>Η</mi><mi>η</mi><mi>Θ</mi><mi>θ</mi><mi>Ι</mi><mi>ι</mi><mi>Κ</mi><mi>κ</mi><mi>Λ</mi><mi>λ</mi><mi>Μ</mi><mi>μ</mi><mi>Ν</mi><mi>ν</mi><mi>Ξ</mi><mi>ξ</mi><mi>Ο</mi><mi>ο</mi><mi>Π</mi><mi>π</mi><mi>Ρ</mi><mi>ρ</mi><mi>Σ</mi><mi>σ</mi><mi>Τ</mi><mi>τ</mi><mi>υ</mi><mi>Φ</mi><mi>φ</mi><mi>Χ</mi><mi>χ</mi><mi>Ψ</mi><mi>ψ</mi><mi>Ω</mi><mi>ω</mi></mrow><annotation encoding="TeX">ΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσΤτυΦφΧχΨψΩω</annotation></semantics></math>'],
    /* Empty mrow */
    ["{}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow/><annotation encoding="TeX">{}</annotation></semantics></math>'],
    /* Nested mrows */
    ["{{{x}}}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="TeX">{{{x}}}</annotation></semantics></math>'],
    /* \\left ... \right */
    ["\\left( x \\right)", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mi>x</mi><mo>)</mo></mrow><annotation encoding="TeX">\\left( x \\right)</annotation></semantics></math>'],
    /* double-struck */
    ["\\mathbb{x}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>𝕩</mi><annotation encoding="TeX">\\mathbb{x}</annotation></semantics></math>'],
    /* *big* */
    ["\\big(\\bigr(\\Big(\\Bigr(\\bigg(\\biggr(\\Bigg(\\Biggr(\\bigl(\\Bigl(\\biggl(\\Biggl(", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo maxsize="1.2em" minsize="1.2em">(</mo><mo maxsize="1.2em" minsize="1.2em">(</mo><mo maxsize="1.8em" minsize="1.8em">(</mo><mo maxsize="1.8em" minsize="1.8em">(</mo><mo maxsize="2.4em" minsize="2.4em">(</mo><mo maxsize="2.4em" minsize="2.4em">(</mo><mo maxsize="3em" minsize="3em">(</mo><mo maxsize="3em" minsize="3em">(</mo><mo maxsize="1.2em" minsize="1.2em">(</mo><mo maxsize="1.8em" minsize="1.8em">(</mo><mo maxsize="2.4em" minsize="2.4em">(</mo><mo maxsize="3em" minsize="3em">(</mo></mrow><annotation encoding="TeX">\\big(\\bigr(\\Big(\\Bigr(\\bigg(\\biggr(\\Bigg(\\Biggr(\\bigl(\\Bigl(\\biggl(\\Biggl(</annotation></semantics></math>'],
    /* math*lap */
    ["\\mathrlap{x}, \\mathllap{y}, \\mathclap{y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mpadded width="0em"><mi>x</mi></mpadded><mo>,</mo><mpadded width="0em" lspace="-100%width"><mi>y</mi></mpadded><mo>,</mo><mpadded width="0em" lspace="-50%width"><mi>y</mi></mpadded></mrow><annotation encoding="TeX">\\mathrlap{x}, \\mathllap{y}, \\mathclap{y}</annotation></semantics></math>'],
    /* infinity */
    ["\\infty \\infinity ∞", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>∞</mn><mn>∞</mn><mn>∞</mn></mrow><annotation encoding="TeX">\\infty \\infinity ∞</annotation></semantics></math>'],
    /* tensor */
/*    ["", ''],*/
    /* matrix */
    ["\\begin{matrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{matrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{matrix}</annotation></semantics></math>'],
    /* pmatrix */
    ["\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mtable rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><mo>)</mo></mrow><annotation encoding="TeX">\\begin{pmatrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{pmatrix}</annotation></semantics></math>'],
]

function escape(aString)
{
    return aString.replace(/([\\\'])/g, "\\$1");
}

var failures = 0;
for (var i = 0; i < tests.length; i++) {
    try {
        var output = parser.toMathMLString(tests[i][0]);
        if (output !== tests[i][1]) {
            throw ("Unexpected output:\n" +
                   "  Actual: '" + escape(output) + "'\n" +
                   "  Expected: '" + escape(tests[i][1]) + "'");
        }
        console.log("Test " + (i + 1) + "... PASS");
    } catch(e) {
        console.log("Test " + (i + 1) + "... FAIL");
        console.log(e);
        failures++;
    }
}

if (failures > 0) {
    console.log(failures + " test(s) failed!")
} else {
    console.log("All tests passed.")
}

// FIXME: use a standard commonJS exit() command?
slimer.exit()
