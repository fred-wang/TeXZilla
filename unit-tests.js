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
    /* FIXME: make these characters mathclass="A" in unicode.xml. */
    ["غظضذخثتشرقصفعسنملكيطحزوهدجب", 'TODO', true],
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
    ["\\& \\% \\$", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>&amp;</mo><mo>%</mo><mi>$</mi></mrow><annotation encoding="TeX">\\&amp; \\% \\$</annotation></semantics></math>'],
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
    /* scripts */
    ["a_b^c + a^c_b + a_b + a^c", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>a</mi><mi>b</mi><mi>c</mi></msubsup><mo>+</mo><msubsup><mi>a</mi><mi>b</mi><mi>c</mi></msubsup><mo>+</mo><msub><mi>a</mi><mi>b</mi></msub><mo>+</mo><msup><mi>a</mi><mi>c</mi></msup></mrow><annotation encoding="TeX">a_b^c + a^c_b + a_b + a^c</annotation></semantics></math>'],
    /* Greek letters */
    ["\\alpha \\beta \\gamma \\delta \\zeta \\eta \\theta \\iota \\kappa \\lambda \\mu \\nu \\xi \\pi \\rho \\sigma \\tau \\upsilon \\chi \\psi \\omega \\backepsilon \\varkappa \\varpi \\varrho \\varsigma \\vartheta \\varepsilon \\phi \\varphi", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mi>β</mi><mi>γ</mi><mi>δ</mi><mi>ζ</mi><mi>η</mi><mi>θ</mi><mi>ι</mi><mi>κ</mi><mi>λ</mi><mi>μ</mi><mi>ν</mi><mi>ξ</mi><mi>π</mi><mi>ρ</mi><mi>σ</mi><mi>τ</mi><mi>υ</mi><mi>χ</mi><mi>ψ</mi><mi>ω</mi><mo>϶</mo><mi>ϰ</mi><mi>ϖ</mi><mi>ϱ</mi><mi>ς</mi><mi>ϑ</mi><mi>ε</mi><mi>ϕ</mi><mi>φ</mi></mrow><annotation encoding="TeX">\\alpha \\beta \\gamma \\delta \\zeta \\eta \\theta \\iota \\kappa \\lambda \\mu \\nu \\xi \\pi \\rho \\sigma \\tau \\upsilon \\chi \\psi \\omega \\backepsilon \\varkappa \\varpi \\varrho \\varsigma \\vartheta \\varepsilon \\phi \\varphi</annotation></semantics></math>'],
    /* FIXME: errors in unicode.xml for \Mu, \Nu etc */
    ["\\Alpha \\Beta \\Delta \\Gamma \\digamma \\Lambda \\Pi \\Phi \\Psi \\Sigma \\Theta \\Xi \\Zeta \\Eta \\Iota \\Kappa \\Mu \\Nu \\Rho \\Tau \\mho \\Omega \\Upsilon \\Upsi", 'TODO', true],
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
    /* space */
    ["\\space{1}{2}{3}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mspace height=".1ex" depth=".2ex" width=".3em"/><annotation encoding="TeX">\\space{1}{2}{3}</annotation></semantics></math>'],
    /* mathraisebox */
    ["\\mathraisebox{1em}x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="1em" height="+1em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{1em}x</annotation></semantics></math>'],
    ["\\mathraisebox{-1em}x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="-1em" height="0pt" depth="+"1em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{-1em}x</annotation></semantics></math>'],
    ["\\mathraisebox{1em}[2em]x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="1em" height="2em" depth="depth"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{1em}[2em]x</annotation></semantics></math>'],
    ["\\mathraisebox{-1em}[2em]x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="-1em" height="2em" depth="+1em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{-1em}[2em]x</annotation></semantics></math>'],
    ["\\mathraisebox{1em}[2em][3em]x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="1em" height="2em" depth="3em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{1em}[2em][3em]x</annotation></semantics></math>'],
    /* maction */
    ["\\tooltip{a}b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><maction actiontype="tooltip"><mi>b</mi><mtext>a</mtext></maction><annotation encoding="TeX">\\tooltip{a}b</annotation></semantics></math>'],
    ["\\statusline{a}b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><maction actiontype="statusline"><mi>b</mi><mtext>a</mtext></maction><annotation encoding="TeX">\\statusline{a}b</annotation></semantics></math>'],
    ["\\toggle a b c \\endtoggle", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><maction actiontype="toggle"><mi>a</mi><mi>b</mi><mi>c</mi></maction><annotation encoding="TeX">\\toggle a b c \\endtoggle</annotation></semantics></math>'],
    /* tensor */
    ["\\tensor x_b^c_d^e_^f", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><mi>b</mi><mi>c</mi><mi>d</mi><mi>e</mi><none/><mi>f</mi></mmultiscripts><annotation encoding="TeX">\\tensor x_b^c_d^e_^f</annotation></semantics></math>'],
    ["\\tensor x{_b^c_d^e_^f}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><mi>b</mi><mi>c</mi><mi>d</mi><mi>e</mi><none/><mi>f</mi></mmultiscripts><annotation encoding="TeX">\\tensor x{_b^c_d^e_^f}</annotation></semantics></math>'],
    /* multiscripts */
    ["\\multiscripts{ }x{^1_2_3^4_^5}",'<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><none/><mn>1</mn><mn>2</mn><none/><mn>3</mn><mn>4</mn><none/><mn>5</mn></mmultiscripts><annotation encoding="TeX">\\multiscripts{ }x{^1_2_3^4_^5}</annotation></semantics></math>'],
    ["\\multiscripts{^1_2_3^4_^5}x{ }",'<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><mprescripts/><none/><mn>1</mn><mn>2</mn><none/><mn>3</mn><mn>4</mn><none/><mn>5</mn></mmultiscripts><annotation encoding="TeX">\\multiscripts{^1_2_3^4_^5}x{ }</annotation></semantics></math>'],
    ["\\multiscripts{^1_2_3^4_^5}x{^1_2_3^4_^5}",'<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><none/><mn>1</mn><mn>2</mn><none/><mn>3</mn><mn>4</mn><none/><mn>5</mn><mprescripts/><none/><mn>1</mn><mn>2</mn><none/><mn>3</mn><mn>4</mn><none/><mn>5</mn></mmultiscripts><annotation encoding="TeX">\\multiscripts{^1_2_3^4_^5}x{^1_2_3^4_^5}</annotation></semantics></math>'],
    /* matrix */
    ["\\begin{matrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{matrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{matrix}</annotation></semantics></math>'],
    /* pmatrix */
    ["\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mtable rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><mo>)</mo></mrow><annotation encoding="TeX">\\begin{pmatrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{pmatrix}</annotation></semantics></math>'],
    /* array */
    ["\\begin{array}{clr} a & b & c \\\\ d & e & f \\end{array}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex" columnalign="center left right"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{array}{clr} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\end{array}</annotation></semantics></math>'],
    ["\\begin{array}[c]{clr} a & b & c \\\\ d & e & f \\end{array}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex" align="center" columnalign="center left right"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{array}[c]{clr} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\end{array}</annotation></semantics></math>'],
    ["\\begin{array}[t]{clr} a & b & c \\\\ d & e & f \\end{array}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex" align="axis 1" columnalign="center left right"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{array}[t]{clr} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\end{array}</annotation></semantics></math>'],
    ["\\begin{array}[b]{clr} a & b & c \\\\ d & e & f \\end{array}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex" align="axis -1" columnalign="center left right"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{array}[b]{clr} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\end{array}</annotation></semantics></math>'],
   /* rowopts */
   ["\\begin{matrix}\\rowopts{\\colalign{left right}\\rowalign{top bottom}} a & b \\\\ \\rowopts{\\rowalign{bottom top}\\colalign{right left}} c & d \\end{matrix}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex"><mtr columnalign="left right" rowalign="top bottom"><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd></mtr><mtr rowalign="bottom top" columnalign="right left"><mtd><mi>c</mi></mtd><mtd><mi>d</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix}\\rowopts{\\colalign{left right}\\rowalign{top bottom}} a &amp; b \\\\ \\rowopts{\\rowalign{bottom top}\\colalign{right left}} c &amp; d \\end{matrix}</annotation></semantics></math>'],
  /* cellopts align */
  ["\\begin{matrix} \\cellopts{\\colalign{left}\\rowalign{top}} a & \\cellopts{\\rowalign{bottom}\\colalign{right}} b \\end{matrix}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex"><mtr><mtd columnalign="left" rowalign="top"><mi>a</mi></mtd><mtd rowalign="bottom" columnalign="right"><mi>b</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix} \\cellopts{\\colalign{left}\\rowalign{top}} a &amp; \\cellopts{\\rowalign{bottom}\\colalign{right}} b \\end{matrix}</annotation></semantics></math>'],
  /* cellopts span */
  ["\\begin{matrix} \\cellopts{\\rowspan{2}\\colspan{3}} a & \\\\ & b & c \\end{matrix}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable rowspacing="0.5ex"><mtr><mtd rowspan="2" colspan="3"><mi>a</mi></mtd><mtd></mtd></mtr><mtr><mtd></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix} \\cellopts{\\rowspan{2}\\colspan{3}} a &amp; \\\\ &amp; b &amp; c \\end{matrix}</annotation></semantics></math>'],
  /* array */
  ["\\array{ a & b \\\\ c & d }", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd></mtr><mtr><mtd><mi>c</mi></mtd><mtd><mi>d</mi></mtd></mtr></mtable><annotation encoding="TeX">\\array{ a &amp; b \\\\ c &amp; d }</annotation></semantics></math>'],
    ["\\array{ \\arrayopts{\\colalign{left right right}\\rowalign{top bottom bottom}\\align{center}\\padding{1em}\\equalrows{true}\\equalcols{true}\\rowlines{dashed}\\collines{dashed}\\frame{solid}} a & b & c}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable columnalign="left right right" rowalign="top bottom bottom" align="center" rowspacing="1em" columnspacing="1em" equalrows="true" equalcolumns="true" rowlines="dashed" columnlines="dashed" frame="solid"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr></mtable><annotation encoding="TeX">\\array{ \\arrayopts{\\colalign{left right right}\\rowalign{top bottom bottom}\\align{center}\\padding{1em}\\equalrows{true}\\equalcols{true}\\rowlines{dashed}\\collines{dashed}\\frame{solid}} a &amp; b &amp; c}</annotation></semantics></math>'],
  /* xarrow */
  ["\\xLeftarrow{x+y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mover><mo>⇐</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mover><annotation encoding="TeX">\\xLeftarrow{x+y}</annotation></semantics></math>'],
  ["\\xLeftarrow[x+y]{}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><munder><mo>⇐</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></munder><annotation encoding="TeX">\\xLeftarrow[x+y]{}</annotation></semantics></math>'],
  ["\\xLeftarrow[x+y]{a+b}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><munderover><mo>⇐</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow></munderover><annotation encoding="TeX">\\xLeftarrow[x+y]{a+b}</annotation></semantics></math>'],
  /* infinity */
  ["\\infty \\infinity ∞", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>∞</mn><mn>∞</mn><mn>∞</mn></mrow><annotation encoding="TeX">\\infty \\infinity ∞</annotation></semantics></math>'],
  /* char commands */
  ["( [ ) ] \\lbrace \\{ \\rbrace \\} \\vert | \\Vert \\| \\setminus \\backslash \\smallsetminus \\sslash \\lfloor \\lceil \\lmoustache \\lang \\langle \\llangle \\rceil \\rmoustache \\rang \\rangle \\rrangle / \\uparrow \\downarrow \\updownarrow", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mo stretchy="false">[</mo><mo stretchy="false">)</mo><mo stretchy="false">]</mo><mo stretchy="false">{</mo><mo stretchy="false">{</mo><mo stretchy="false">}</mo><mo stretchy="false">}</mo><mo stretchy="false">|</mo><mo stretchy="false">|</mo><mo stretchy="false">‖</mo><mo stretchy="false">‖</mo><mo>∖</mo><mo>\\</mo><mo>∖</mo><mo>⫽</mo><mo stretchy="false">⌊</mo><mo stretchy="false">⌈</mo><mo>⎰</mo><mo stretchy="false">⟨</mo><mo stretchy="false">⟨</mo><mo stretchy="false">⟪</mo><mo stretchy="false">⌉</mo><mo>⎱</mo><mo stretchy="false">⟩</mo><mo stretchy="false">⟩</mo><mo stretchy="false">⟫</mo><mo>/</mo><mo stretchy="false">↑</mo><mo stretchy="false">↓</mo><mo stretchy="false">↕</mo></mrow><annotation encoding="TeX">( [ ) ] \\lbrace \\{ \\rbrace \\} \\vert | \\Vert \\| \\setminus \\backslash \\smallsetminus \\sslash \\lfloor \\lceil \\lmoustache \\lang \\langle \\llangle \\rceil \\rmoustache \\rang \\rangle \\rrangle / \\uparrow \\downarrow \\updownarrow</annotation></semantics></math>'],
  /* char commands */
  [". - + \\# , : ! = ~ ; ? # ` *", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>.</mo><mo>-</mo><mo>+</mo><mo>#</mo><mo>,</mo><mo>:</mo><mo>!</mo><mo>=</mo><mo stretchy="false">~</mo><mo>;</mo><mo>?</mo><mo>#</mo><mo>`</mo><mo>*</mo></mrow><annotation encoding="TeX">. - + \\# , : ! = ~ ; ? # ` *</annotation></semantics></math>'],
  /* primes */
  ["\\prime ' '' ''' ''''", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>′</mo><mo>′</mo><mo>″</mo><mo>‴</mo><mo>⁗</mo></mrow><annotation encoding="TeX">\\prime \' \'\' \'\'\' \'\'\'\'</annotation></semantics></math>'],
  /* char commands */
    ["\\omicron \\epsilon \\cdot", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ℴ</mi><mi>ϵ</mi><mo>⋅</mo></mrow><annotation encoding="TeX">\\omicron \\epsilon \\cdot</annotation></semantics></math>'],

  /* char commands */
  ["\\dots \\ldots \\cdots \\ddots \\udots \\vdots \\colon \\cup \\union \\bigcup \\Union \\cap \\intersection \\bigcap \\Intersection \\in", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>…</mo><mo>…</mo><mo>⋯</mo><mo>⋱</mo><mo>⋰</mo><mo>⋮</mo><mo>:</mo><mo>∪</mo><mo>∪</mo><mo>⋃</mo><mo>⋃</mo><mo>∩</mo><mo>∩</mo><mo>⋂</mo><mo>⋂</mo><mi>𝟄</mi></mrow><annotation encoding="TeX">\\dots \\ldots \\cdots \\ddots \\udots \\vdots \\colon \\cup \\union \\bigcup \\Union \\cap \\intersection \\bigcap \\Intersection \\in</annotation></semantics></math>'],
  /* char commands */
  ["\\coloneqq \\Coloneqq \\coloneq \\Coloneq \\eqqcolon \\Eqqcolon \\eqcolon \\Eqcolon \\colonapprox \\Colonapprox \\colonsim \\Colonsim \\dblcolon", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≔</mo><mo>⩴</mo><mo>≔</mo><mo>∷−</mo><mo>≕</mo><mo>=∷</mo><mo>≕</mo><mo>−∷</mo><mo>∶≈</mo><mo>∷≈</mo><mo>∶∼</mo><mo>∷∼</mo><mo>∷</mo></mrow><annotation encoding="TeX">\\coloneqq \\Coloneqq \\coloneq \\Coloneq \\eqqcolon \\Eqqcolon \\eqcolon \\Eqcolon \\colonapprox \\Colonapprox \\colonsim \\Colonsim \\dblcolon</annotation></semantics></math>'],
  /* char commands */
  ["\\ast \\Cap \\Cup \\circledast \\circledcirc \\curlyvee \\curlywedge \\divideontimes \\dotplus \\leftthreetimes \\rightthreetimes \\veebar \\gt \\lt \\approxeq \\backsim \\backsimeq \\barwedge \\doublebarwedge \\subset \\subseteq \\subseteqq \\subsetneq \\subsetneqq \\varsubsetneq \\varsubsetneqq \\prec \\parallel \\nparallel \\shortparallel \\nshortparallel \\perp \\eqslantgtr \\eqslantless \\gg \\ggg \\geq \\geqq \\geqslant \\gneq \\gneqq \\gnapprox \\gnsim \\gtrapprox \\ge \\le \\leq \\leqq \\leqslant \\lessapprox \\lessdot \\lesseqgtr \\lesseqqgtr \\lessgtr \\lneq \\lneqq \\lnsim \\lvertneqq \\gtrsim \\gtrdot \\gtreqless \\gtreqqless \\gtrless \\gvertneqq \\lesssim \\lnapprox \\nsubset \\nsubseteq \\nsubseteqq \\notin \\ni \\notni", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>∗</mo><mo>⋒</mo><mo>⋓</mo><mo>⊛</mo><mo>⊚</mo><mo>⋎</mo><mo>⋏</mo><mo>⋇</mo><mo>∔</mo><mo>⋋</mo><mo>⋌</mo><mo>⊻</mo><mo>></mo><mo>&lt;</mo><mo>≊</mo><mo>∽</mo><mo>⋍</mo><mo>⌅</mo><mo>⌆</mo><mo>⊂</mo><mo>⊆</mo><mo>⫅</mo><mo>⊊</mo><mo>⫋</mo><mo>⊊︀</mo><mo>⫋︀</mo><mo>≺</mo><mo>∥</mo><mo>∦</mo><mo>∥</mo><mo>∦</mo><mo>⊥</mo><mo>⪖</mo><mo>⪕</mo><mo>≫</mo><mo>⋙</mo><mo>≥</mo><mo>≧</mo><mo>⩾</mo><mo>⪈</mo><mo>≩</mo><mo>⪊</mo><mo>⋧</mo><mo>⪆</mo><mo>≥</mo><mo>≤</mo><mo>≤</mo><mo>≦</mo><mo>⩽</mo><mo>⪅</mo><mo>⋖</mo><mo>⋚</mo><mo>⪋</mo><mo>≶</mo><mo>⪇</mo><mo>≨</mo><mo>⋦</mo><mo>≨︀</mo><mo>≳</mo><mo>⋗</mo><mo>⋛</mo><mo>⪌</mo><mo>≷</mo><mo>≩︀</mo><mo>≲</mo><mo>⪉</mo><mo>⊄</mo><mo>⊈</mo><mo>⊈</mo><mo>∉</mo><mo>∋</mo><mo>∌</mo></mrow><annotation encoding="TeX">\\ast \\Cap \\Cup \\circledast \\circledcirc \\curlyvee \\curlywedge \\divideontimes \\dotplus \\leftthreetimes \\rightthreetimes \\veebar \\gt \\lt \\approxeq \\backsim \\backsimeq \\barwedge \\doublebarwedge \\subset \\subseteq \\subseteqq \\subsetneq \\subsetneqq \\varsubsetneq \\varsubsetneqq \\prec \\parallel \\nparallel \\shortparallel \\nshortparallel \\perp \\eqslantgtr \\eqslantless \\gg \\ggg \\geq \\geqq \\geqslant \\gneq \\gneqq \\gnapprox \\gnsim \\gtrapprox \\ge \\le \\leq \\leqq \\leqslant \\lessapprox \\lessdot \\lesseqgtr \\lesseqqgtr \\lessgtr \\lneq \\lneqq \\lnsim \\lvertneqq \\gtrsim \\gtrdot \\gtreqless \\gtreqqless \\gtrless \\gvertneqq \\lesssim \\lnapprox \\nsubset \\nsubseteq \\nsubseteqq \\notin \\ni \\notni</annotation></semantics></math>'],

  /* char commands */
  ["\\nmid \\nshortmid \\preceq \\npreceq \\ll \\ngeq \\ngeqq \\ngeqslant \\nleq \\nleqq \\nleqslant \\nless \\supset \\supseteq \\supseteqq \\supsetneq \\supsetneqq \\varsupsetneq \\varsupsetneqq \\approx \\asymp \\bowtie \\dashv \\Vdash \\vDash \\VDash \\vdash \\Vvdash \\models \\sim \\simeq \\nsim \\smile \\triangle \\triangledown \\triangleleft \\cong \\succ \\nsucc \\ngtr \\nsupset \\nsupseteq \\propto \\equiv \\nequiv \\frown \\triangleright \\ncong \\succeq \\succapprox \\succnapprox \\succcurlyeq \\succsim \\succnsim \\nsucceq \\nvDash \\nvdash \\nVDash \\amalg \\pm \\mp \\bigcirc \\wr \\odot \\uplus \\clubsuit \\spadesuit \\Diamond \\diamond \\sqcup \\sqcap \\sqsubset \\sqsubseteq \\sqsupset \\sqsupseteq \\Subset \\Supset", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>∤</mo><mo>∤</mo><mo>⪯</mo><mo>⪯̸</mo><mo>≪</mo><mo>≱</mo><mo>⩾̸</mo><mo>⩾̸</mo><mo>≰</mo><mo>⩽̸</mo><mo>⩽̸</mo><mo>≮</mo><mo>⊃</mo><mo>⊇</mo><mo>⫆</mo><mo>⊋</mo><mo>⫌</mo><mo>⊋︀</mo><mo>⊋︀</mo><mi>q</mi><mo>≈</mo><mo>≍</mo><mo>⋈</mo><mo>⊣</mo><mo>⊩</mo><mo>⊨</mo><mo>⊫</mo><mo>⊢</mo><mo>⊪</mo><mo>⊨</mo><mo>∼</mo><mo>≃</mo><mo>≁</mo><mo>⌣</mo><mo>▵</mo><mo>▿</mo><mo>◃</mo><mo>≅</mo><mo>≻</mo><mo>⊁</mo><mo>≯</mo><mo>⊅</mo><mo>⊉</mo><mo>∝</mo><mo>≡</mo><mo>≢</mo><mo>⌢</mo><mo>▹</mo><mo>≇</mo><mo>⪰</mo><mo>⪸</mo><mo>⪺</mo><mo>≽</mo><mo>≿</mo><mo>⋩</mo><mo>⪰̸</mo><mo>⊭</mo><mo>⊬</mo><mo>⊯</mo><mo>⨿</mo><mo>±</mo><mo>∓</mo><mo>○</mo><mo>≀</mo><mo>⊙</mo><mo>⊎</mo><mo>♣</mo><mo>♠</mo><mo>⋄</mo><mo>♢</mo><mo>⊔</mo><mo>⊓</mo><mo>⊏</mo><mo>⊑</mo><mo>⊐</mo><mo>⊒</mo><mo>⋐</mo><mo>⋑</mo></mrow><annotation encoding="TeX">\\nmid \\nshortmid \\preceq \\npreceq \\ll \\ngeq \\ngeqq \\ngeqslant \\nleq \\nleqq \\nleqslant \\nless \\supset \\supseteq \\supseteqq \\supsetneq \\supsetneqq \\varsupsetneq \\varsupsetneqq \\approx \\asymp \\bowtie \\dashv \\Vdash \\vDash \\VDash \\vdash \\Vvdash \\models \\sim \\simeq \\nsim \\smile \\triangle \\triangledown \\triangleleft \\cong \\succ \\nsucc \\ngtr \\nsupset \\nsupseteq \\propto \\equiv \\nequiv \\frown \\triangleright \\ncong \\succeq \\succapprox \\succnapprox \\succcurlyeq \\succsim \\succnsim \\nsucceq \\nvDash \\nvdash \\nVDash \\amalg \\pm \\mp \\bigcirc \\wr \\odot \\uplus \\clubsuit \\spadesuit \\Diamond \\diamond \\sqcup \\sqcap \\sqsubset \\sqsubseteq \\sqsupset \\sqsupseteq \\Subset \\Supset</annotation></semantics></math>'],

  /* char commands */
   ["\\ltimes \\div \\rtimes \\bot \\therefore \\thickapprox \\thicksim \\varpropto \\varnothing \\flat \\vee \\because \\between \\Bumpeq \\bumpeq \\circeq \\curlyeqprec \\curlyeqsucc \\doteq \\doteqdot \\eqcirc \\fallingdotseq \\multimap \\pitchfork \\precapprox \\precnapprox \\preccurlyeq \\precsim \\precnsim \\risingdotseq \\sharp \\bullet \\nexists \\dagger \\ddagger \\not \\top \\natural \\angle \\measuredangle \\backprime \\bigstar \\blacklozenge \\lozenge \\blacksquare \\blacktriangle \\blacktriangleleft \\blacktriangleright \\blacktriangledown \\ntriangleleft \\ntriangleright \\ntrianglelefteq \\ntrianglerighteq \\trianglelefteq \\trianglerighteq \\triangleq \\vartriangleleft \\vartriangleright \\forall \\bigtriangleup \\bigtriangledown \\nprec", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⋉</mo><mo>÷</mo><mo>⋊</mo><mo>⊥</mo><mo>∴</mo><mo>≈</mo><mo>∼</mo><mo>∝</mo><mi>∅</mi><mo>♭</mo><mo>∨</mo><mo>∵</mo><mo>≬</mo><mo>≎</mo><mo>≏</mo><mo>≗</mo><mo>⋞</mo><mo>⋟</mo><mo>≐</mo><mo>≑</mo><mo>≖</mo><mo>≒</mo><mo>⊸</mo><mo>⋔</mo><mo>⪷</mo><mo>⪹</mo><mo>≼</mo><mo>≾</mo><mo>⋨</mo><mo>≓</mo><mo>♯</mo><mo>∙</mo><mo>∄</mo><mo>†</mo><mo>‡</mo><mo>≠</mo><mo>⊤</mo><mo>♮</mo><mo>∠</mo><mo>∡</mo><mo>‵</mo><mo>★</mo><mo>⧫</mo><mo>◊</mo><mo>▪</mo><mo>▴</mo><mo>◂</mo><mo>▸</mo><mo>▾</mo><mo>⋪</mo><mo>⋫</mo><mo>⋬</mo><mo>⋭</mo><mo>⊴</mo><mo>⊵</mo><mo>≜</mo><mo>⊲</mo><mo>⊳</mo><mo>∀</mo><mo>△</mo><mo>▽</mo><mo>⊀</mo></mrow><annotation encoding="TeX">\\ltimes \\div \\rtimes \\bot \\therefore \\thickapprox \\thicksim \\varpropto \\varnothing \\flat \\vee \\because \\between \\Bumpeq \\bumpeq \\circeq \\curlyeqprec \\curlyeqsucc \\doteq \\doteqdot \\eqcirc \\fallingdotseq \\multimap \\pitchfork \\precapprox \\precnapprox \\preccurlyeq \\precsim \\precnsim \\risingdotseq \\sharp \\bullet \\nexists \\dagger \\ddagger \\not \\top \\natural \\angle \\measuredangle \\backprime \\bigstar \\blacklozenge \\lozenge \\blacksquare \\blacktriangle \\blacktriangleleft \\blacktriangleright \\blacktriangledown \\ntriangleleft \\ntriangleright \\ntrianglelefteq \\ntrianglerighteq \\trianglelefteq \\trianglerighteq \\triangleq \\vartriangleleft \\vartriangleright \\forall \\bigtriangleup \\bigtriangledown \\nprec</annotation></semantics></math>'],

  /* char commands */
  ["\\aleph \\beth \\eth \\ell \\hbar \\Im \\imath \\jmath \\wp \\Re", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ℵ</mi><mi>ℶ</mi><mi>ð</mi><mi>ℓ</mi><mi>ℏ</mi><mi>ℑ</mi><mi>ı</mi><mi>ȷ</mi><mi>℘</mi><mi>ℜ</mi></mrow><annotation encoding="TeX">\\aleph \\beth \\eth \\ell \\hbar \\Im \\imath \\jmath \\wp \\Re</annotation></semantics></math>'],

  /* char commands */
  /* FIXME: unicode.xml maps \nabla to different characters. */
    ["\\Perp \\Vbar \\boxdot \\Box \\square \\emptyset \\empty \\exists \\circ \\rhd \\lhd \\lll \\unrhd \\unlhd \\Del \\nabla \\sphericalangle \\heartsuit \\diamondsuit \\partial \\qed", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⫫</mo><mo>⫫</mo><mo>⊡</mo><mo>□</mo><mo>□</mo><mi>∅</mi><mi>∅</mi><mo>∃</mo><mo>∘</mo><mo>⊳</mo><mo>⊲</mo><mo>⋘</mo><mo>⊵</mo><mo>⊴</mo><mo>∇</mo><mo>∇</mo><mo>∢</mo><mo>♡</mo><mo>♢</mo><mi>∂</mi><mo>▪</mo></mrow><annotation encoding="TeX">\\Perp \\Vbar \\boxdot \\Box \\square \\emptyset \\empty \\exists \\circ \\rhd \\lhd \\lll \\unrhd \\unlhd \\Del \\nabla \\sphericalangle \\heartsuit \\diamondsuit \\partial \\qed</annotation></semantics></math>', true],
  /* char commands */
  ["\\bottom \\neg \\neq \\ne \\shortmid \\mid \\int \\integral \\iint \\doubleintegral \\iiint \\tripleintegral \\iiiint \\quadrupleintegral \\oint \\conint \\contourintegral \\times \\star \\circleddash \\odash \\intercal \\smallfrown \\smallsmile \\boxminus \\minusb \\boxplus \\plusb \\boxtimes \\timesb \\sum \\prod \\product \\coprod \\coproduct \\otimes \\Otimes \\bigotimes \\ominus \\oslash \\oplus \\Oplus \\bigoplus \\bigodot \\bigsqcup \\bigsqcap \\biginterleave \\biguplus \\wedge \\Wedge \\bigwedge \\Vee \\bigvee \\invamp \\parr", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⊥</mo><mo>¬</mo><mo>≠</mo><mo>≠</mo><mo>∣</mo><mo>∣</mo><mo>∫</mo><mo>∫</mo><mo>∬</mo><mo>∬</mo><mo>∭</mo><mo>∭</mo><mo>⨌</mo><mo>⨌</mo><mo>∮</mo><mo>∮</mo><mo>∮</mo><mo>×</mo><mo>⋆</mo><mo>⊝</mo><mo>⊝</mo><mo>⊺</mo><mo>⌢</mo><mo>⌣</mo><mo>⊟</mo><mo>⊟</mo><mo>⊞</mo><mo>⊞</mo><mo>⊠</mo><mo>⊠</mo><mo>∑</mo><mo>∏</mo><mo>∏</mo><mo>∐</mo><mo>∐</mo><mo>⊗</mo><mo>⨴</mo><mo>⨂</mo><mo>⊖</mo><mo>⊘</mo><mo>⊕</mo><mo>⨭</mo><mo>⨁</mo><mo>⨀</mo><mo>⨆</mo><mo>⨅</mo><mo>⫼</mo><mo>⨄</mo><mo>∧</mo><mo>⋀</mo><mo>⋀</mo><mo>⋁</mo><mo>⋁</mo><mo>⅋</mo><mo>⅋</mo></mrow><annotation encoding="TeX">\\bottom \\neg \\neq \\ne \\shortmid \\mid \\int \\integral \\iint \\doubleintegral \\iiint \\tripleintegral \\iiiint \\quadrupleintegral \\oint \\conint \\contourintegral \\times \\star \\circleddash \\odash \\intercal \\smallfrown \\smallsmile \\boxminus \\minusb \\boxplus \\plusb \\boxtimes \\timesb \\sum \\prod \\product \\coprod \\coproduct \\otimes \\Otimes \\bigotimes \\ominus \\oslash \\oplus \\Oplus \\bigoplus \\bigodot \\bigsqcup \\bigsqcap \\biginterleave \\biguplus \\wedge \\Wedge \\bigwedge \\Vee \\bigvee \\invamp \\parr</annotation></semantics></math>']
]

function escape(aString)
{
    return aString.replace(/([\\\'])/g, "\\$1");
}

var failures = 0, unexpectedfailures = 0;
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
        console.log("Test " + (i + 1) + "... " +
                    (tests[i][2] ? "EXPECTED FAIL" : "FAIL"));
        console.log(e);
        failures++;
        if (!tests[i][2]) unexpectedfailures++;
    }
}

if (failures > 0) {
    console.log(failures + " test(s) failed (" +
                unexpectedfailures + " unexpected).")
} else {
    console.log("All tests passed.")
}

// FIXME: use a standard commonJS exit() command?
slimer.exit()
