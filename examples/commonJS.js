/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var TeXZilla = require("../TeXZilla");
var examples = [
    { title: "Ellipse Equation", tex: "\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1"},
    { title: "Sum 1/n²", tex: "\\sum_{n=1}^{+\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}" },
    { title: "Sum 1/n² (Unicode)", tex: "∑_{n=1}^{+∞} \\frac{1}{n^2} = \\frac{π^2}{6}" },
    { title: "Quadratic Formula", tex: "x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}" },
    { title: "Quadratic Formula (Arabic)", tex: "س = \\frac{-ب\\pm\\sqrt{ب^٢-٤اج}}{٢ا}" },
    { title: "Fourier Transform", tex: "f(x)=\\sum_{n=-\\infty}^\\infty c_n e^{2\\pi i(n/T) x} =\\sum_{n=-\\infty}^\\infty \\hat{f}(\\xi_n) e^{2\\pi i\\xi_n x}\\Delta\\xi" },
    { title: "Gamma function", tex: "\\Gamma(t) = \\lim_{n \\to \\infty} \\frac{n! \\; n^t}{t \\; (t+1)\\cdots(t+n)}= \\frac{1}{t} \\prod_{n=1}^\\infty \\frac{\\left(1+\\frac{1}{n}\\right)^t}{1+\\frac{t}{n}} = \\frac{e^{-\\gamma t}}{t} \\prod_{n=1}^\\infty \\left(1 + \\frac{t}{n}\\right)^{-1} e^{\\frac{t}{n}}" },
    { title: "Lie Algebra", tex: "\\mathfrak{sl}(n, \\mathbb{F}) = \\left\\{ A \\in \\mathscr{M}_n(\\mathbb{F}) : \\operatorname{Tr}(A) = 0 \\right\\}" }
];

for (var i in examples) {
    console.log(examples[i].title + "\n");
    console.log("input: " + examples[i].tex + "\n");
    console.log("output: " + TeXZilla.toMathMLString(examples[i].tex) + "\n\n");
}
