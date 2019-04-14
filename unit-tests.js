/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var TeXZilla = require("./TeXZilla");
var hasDOMAPI = (typeof window !== "undefined" &&
                 typeof DOMParser !== "undefined" &&
                 typeof XMLSerializer !== "undefined" &&
                 typeof Image != "undefined");

var tests = [
    /* Empty content */
    ["", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow/><annotation encoding="TeX"/></semantics></math>'],
    /* escaped characters */
    ["\\& \\% \\$", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>&amp;</mi><mi>%</mi><mi>$</mi></mrow><annotation encoding="TeX">\\&amp; \\% \\$</annotation></semantics></math>'],
    /* variable and numbers */
    ["2xy", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi>x</mi><mi>y</mi></mrow><annotation encoding="TeX">2xy</annotation></semantics></math>'],
    /* variable and numbers with spaces */
    ["2 x y", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi>x</mi><mi>y</mi></mrow><annotation encoding="TeX">2 x y</annotation></semantics></math>'],
    /* number between variables */
    ["x2y", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mn>2</mn><mi>y</mi></mrow><annotation encoding="TeX">x2y</annotation></semantics></math>'],
    /* number between variables with spaces */
    ["x 2 y", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mn>2</mn><mi>y</mi></mrow><annotation encoding="TeX">x 2 y</annotation></semantics></math>'],
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
    /* scripts */
    ["a_b^c", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msubsup><mi>a</mi><mi>b</mi><mi>c</mi></msubsup><annotation encoding="TeX">a_b^c</annotation></semantics></math>'],
    /* long scripts */
    ["a_{b c}^{d e}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msubsup><mi>a</mi><mrow><mi>b</mi><mi>c</mi></mrow><mrow><mi>d</mi><mi>e</mi></mrow></msubsup><annotation encoding="TeX">a_{b c}^{d e}</annotation></semantics></math>'],
    /* subscripts and primes */
    ["a_1' + b'_2 = c'", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>a</mi><mn>1</mn><mo>′</mo></msubsup><mo>+</mo><msubsup><mi>b</mi><mn>2</mn><mo>′</mo></msubsup><mo>=</mo><msup><mi>c</mi><mo>′</mo></msup></mrow><annotation encoding="TeX">a_1\' + b\'_2 = c\'</annotation></semantics></math>'],
    /* Functions */
    ["\\arccos \\arcsin \\arctan \\arg \\cos \\cosh \\cot \\coth \\csc \\deg \\dim  \\exp \\hom \\ker \\lg \\ln \\log \\sec \\sin \\sinh \\tan \\tanh \\det \\gcd \\inf \\lim \\liminf \\limsup \\max \\min \\Pr \\sup", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo lspace="0em" rspace="0em">arccos</mo><mo lspace="0em" rspace="0em">arcsin</mo><mo lspace="0em" rspace="0em">arctan</mo><mo lspace="0em" rspace="0em">arg</mo><mo lspace="0em" rspace="0em">cos</mo><mo lspace="0em" rspace="0em">cosh</mo><mo lspace="0em" rspace="0em">cot</mo><mo lspace="0em" rspace="0em">coth</mo><mo lspace="0em" rspace="0em">csc</mo><mo lspace="0em" rspace="0em">deg</mo><mo lspace="0em" rspace="0em">dim</mo><mo lspace="0em" rspace="0em">exp</mo><mo lspace="0em" rspace="0em">hom</mo><mo lspace="0em" rspace="0em">ker</mo><mo lspace="0em" rspace="0em">lg</mo><mo lspace="0em" rspace="0em">ln</mo><mo lspace="0em" rspace="0em">log</mo><mo lspace="0em" rspace="0em">sec</mo><mo lspace="0em" rspace="0em">sin</mo><mo lspace="0em" rspace="0em">sinh</mo><mo lspace="0em" rspace="0em">tan</mo><mo lspace="0em" rspace="0em">tanh</mo><mo lspace="0em" rspace="0em">det</mo><mo lspace="0em" rspace="0em">gcd</mo><mo lspace="0em" rspace="0em">inf</mo><mo lspace="0em" rspace="0em">lim</mo><mo lspace="0em" rspace="0em">liminf</mo><mo lspace="0em" rspace="0em">limsup</mo><mo lspace="0em" rspace="0em">max</mo><mo lspace="0em" rspace="0em">min</mo><mo lspace="0em" rspace="0em">Pr</mo><mo lspace="0em" rspace="0em">sup</mo></mrow><annotation encoding="TeX">\\arccos \\arcsin \\arctan \\arg \\cos \\cosh \\cot \\coth \\csc \\deg \\dim  \\exp \\hom \\ker \\lg \\ln \\log \\sec \\sin \\sinh \\tan \\tanh \\det \\gcd \\inf \\lim \\liminf \\limsup \\max \\min \\Pr \\sup</annotation></semantics></math>'], 
    ["\\arccos_1 \\arcsin^2 \\arctan_1^2 \\arg^2_1 \\cos_1 \\cosh^2 \\cot_1^2 \\coth^2_1 \\csc_1 \\deg^2 \\dim_1^2  \\exp^2_1 \\hom_1 \\ker^2 \\lg_1^2 \\ln^2_1 \\log_1 \\sec^2 \\sin_1^2 \\sinh^2_1 \\tan_1 \\tanh^2 \\det_1^2 \\gcd^2_1 \\inf_1 \\lim^2 \\liminf_1^2 \\limsup^2_1 \\max_1 \\min^2 \\Pr_1^2 \\sup^2_1", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mo lspace="0em" rspace="0em">arccos</mo><mn>1</mn></msub><msup><mo lspace="0em" rspace="0em">arcsin</mo><mn>2</mn></msup><msubsup><mo lspace="0em" rspace="0em">arctan</mo><mn>1</mn><mn>2</mn></msubsup><msubsup><mo lspace="0em" rspace="0em">arg</mo><mn>1</mn><mn>2</mn></msubsup><msub><mo lspace="0em" rspace="0em">cos</mo><mn>1</mn></msub><msup><mo lspace="0em" rspace="0em">cosh</mo><mn>2</mn></msup><msubsup><mo lspace="0em" rspace="0em">cot</mo><mn>1</mn><mn>2</mn></msubsup><msubsup><mo lspace="0em" rspace="0em">coth</mo><mn>1</mn><mn>2</mn></msubsup><msub><mo lspace="0em" rspace="0em">csc</mo><mn>1</mn></msub><msup><mo lspace="0em" rspace="0em">deg</mo><mn>2</mn></msup><msubsup><mo lspace="0em" rspace="0em">dim</mo><mn>1</mn><mn>2</mn></msubsup><msubsup><mo lspace="0em" rspace="0em">exp</mo><mn>1</mn><mn>2</mn></msubsup><msub><mo lspace="0em" rspace="0em">hom</mo><mn>1</mn></msub><msup><mo lspace="0em" rspace="0em">ker</mo><mn>2</mn></msup><msubsup><mo lspace="0em" rspace="0em">lg</mo><mn>1</mn><mn>2</mn></msubsup><msubsup><mo lspace="0em" rspace="0em">ln</mo><mn>1</mn><mn>2</mn></msubsup><msub><mo lspace="0em" rspace="0em">log</mo><mn>1</mn></msub><msup><mo lspace="0em" rspace="0em">sec</mo><mn>2</mn></msup><msubsup><mo lspace="0em" rspace="0em">sin</mo><mn>1</mn><mn>2</mn></msubsup><msubsup><mo lspace="0em" rspace="0em">sinh</mo><mn>1</mn><mn>2</mn></msubsup><msub><mo lspace="0em" rspace="0em">tan</mo><mn>1</mn></msub><msup><mo lspace="0em" rspace="0em">tanh</mo><mn>2</mn></msup><munderover><mo lspace="0em" rspace="0em">det</mo><mn>1</mn><mn>2</mn></munderover><munderover><mo lspace="0em" rspace="0em">gcd</mo><mn>1</mn><mn>2</mn></munderover><munder><mo lspace="0em" rspace="0em">inf</mo><mn>1</mn></munder><mover><mo lspace="0em" rspace="0em">lim</mo><mn>2</mn></mover><munderover><mo lspace="0em" rspace="0em">liminf</mo><mn>1</mn><mn>2</mn></munderover><munderover><mo lspace="0em" rspace="0em">limsup</mo><mn>1</mn><mn>2</mn></munderover><munder><mo lspace="0em" rspace="0em">max</mo><mn>1</mn></munder><mover><mo lspace="0em" rspace="0em">min</mo><mn>2</mn></mover><munderover><mo lspace="0em" rspace="0em">Pr</mo><mn>1</mn><mn>2</mn></munderover><munderover><mo lspace="0em" rspace="0em">sup</mo><mn>1</mn><mn>2</mn></munderover></mrow><annotation encoding="TeX">\\arccos_1 \\arcsin^2 \\arctan_1^2 \\arg^2_1 \\cos_1 \\cosh^2 \\cot_1^2 \\coth^2_1 \\csc_1 \\deg^2 \\dim_1^2  \\exp^2_1 \\hom_1 \\ker^2 \\lg_1^2 \\ln^2_1 \\log_1 \\sec^2 \\sin_1^2 \\sinh^2_1 \\tan_1 \\tanh^2 \\det_1^2 \\gcd^2_1 \\inf_1 \\lim^2 \\liminf_1^2 \\limsup^2_1 \\max_1 \\min^2 \\Pr_1^2 \\sup^2_1</annotation></semantics></math>'],

    /**** closedTerm in the grammar ****/
    /* Empty mrow */
    ["{}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow/><annotation encoding="TeX">{}</annotation></semantics></math>'],
    /* Nested mrows */
    ["{{{x}}}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="TeX">{{{x}}}</annotation></semantics></math>'],
    /* *big* */
    ["\\big(\\bigr(\\Big(\\Bigr(\\bigg(\\biggr(\\Bigg(\\Biggr(\\bigl(\\Bigl(\\biggl(\\Biggl(", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo maxsize="1.2em" minsize="1.2em">(</mo><mo maxsize="1.2em" minsize="1.2em">(</mo><mo maxsize="1.8em" minsize="1.8em">(</mo><mo maxsize="1.8em" minsize="1.8em">(</mo><mo maxsize="2.4em" minsize="2.4em">(</mo><mo maxsize="2.4em" minsize="2.4em">(</mo><mo maxsize="3em" minsize="3em">(</mo><mo maxsize="3em" minsize="3em">(</mo><mo maxsize="1.2em" minsize="1.2em">(</mo><mo maxsize="1.8em" minsize="1.8em">(</mo><mo maxsize="2.4em" minsize="2.4em">(</mo><mo maxsize="3em" minsize="3em">(</mo></mrow><annotation encoding="TeX">\\big(\\bigr(\\Big(\\Bigr(\\bigg(\\biggr(\\Bigg(\\Biggr(\\bigl(\\Bigl(\\biggl(\\Biggl(</annotation></semantics></math>'],
    /* \\left ... \right */
    ["\\left( x \\right)", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mi>x</mi><mo>)</mo></mrow><annotation encoding="TeX">\\left( x \\right)</annotation></semantics></math>'],
    /* \mn */
    ["\\mn{TWO}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>TWO</mn><annotation encoding="TeX">\\mn{TWO}</annotation></semantics></math>'],
    /* single digit */
    ["1", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>1</mn><annotation encoding="TeX">1</annotation></semantics></math>'],
    /* integer */
    ["123", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>123</mn><annotation encoding="TeX">123</annotation></semantics></math>'],
    /* decimal number */
    ["01234.56789", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>01234.56789</mn><annotation encoding="TeX">01234.56789</annotation></semantics></math>'],
    /* Arabic number */
    ["١٢٣٤٫٥٦٧", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>١٢٣٤٫٥٦٧</mn><annotation encoding="TeX">١٢٣٤٫٥٦٧</annotation></semantics></math>'],
    /* bold, double-struck, sans-serif sans-serif bold, monospace numbers */
    ["𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗 𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡 𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫 𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵 𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗</mn><mn>𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡</mn><mn>𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫</mn><mn>𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵</mn><mn>𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿</mn></mrow><annotation encoding="TeX">𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗 𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡 𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫 𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵 𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿</annotation></semantics></math>'],
    /* itexnum */
    ["\\itexnum{blah}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mn>blah</mn><annotation encoding="TeX">\\itexnum{blah}</annotation></semantics></math>'],
    /* whitespace collapse. Note: the leading/trailing space in the mtext
       output are no-break space. */
    ["\\mtext{  x   y  }", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext> x y </mtext><annotation encoding="TeX">\\mtext{  x   y  }</annotation></semantics></math>'],
    /* escaped characters */
    ["\\mtext{2i\\}fzx\\\\}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>2i}fzx\\</mtext><annotation encoding="TeX">\\mtext{2i\\}fzx\\\\}</annotation></semantics></math>'],
    /* escape > that could lead to invalid XML */
    ["\\text{]]>}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>]]&gt;</mtext><annotation encoding="TeX">\\text{]]&gt;}</annotation></semantics></math>'],
    /* \text */
    ["\\text{blah}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>blah</mtext><annotation encoding="TeX">\\text{blah}</annotation></semantics></math>'],
    /* single variable */
    ["x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="TeX">x</annotation></semantics></math>'],
    /* multiple variable */
    ["xyz", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mi>y</mi><mi>z</mi></mrow><annotation encoding="TeX">xyz</annotation></semantics></math>'],
    /* multiple variable with spaces */
    ["x y z", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mi>y</mi><mi>z</mi></mrow><annotation encoding="TeX">x y z</annotation></semantics></math>'],
    /* Arabic variables */
    ["غظضذخثتشرقصفعسنملكيطحزوهدجب", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>غ</mi><mi>ظ</mi><mi>ض</mi><mi>ذ</mi><mi>خ</mi><mi>ث</mi><mi>ت</mi><mi>ش</mi><mi>ر</mi><mtext>ق</mtext><mi>ص</mi><mtext>ف</mtext><mi>ع</mi><mi>س</mi><mtext>ن</mtext><mtext>م</mtext><mtext>ل</mtext><mtext>ك</mtext><mtext>ي</mtext><mi>ط</mi><mi>ح</mi><mi>ز</mi><mtext>و</mtext><mtext>ه</mtext><mi>د</mi><mi>ج</mi><mi>ب</mi></mrow><annotation encoding="TeX">غظضذخثتشرقصفعسنملكيطحزوهدجب</annotation></semantics></math>'],
    /* \mi \mn \mo */
    ["\\mi{x} \\mn{y} \\mo{z}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mn>y</mn><mo>z</mo></mrow><annotation encoding="TeX">\\mi{x} \\mn{y} \\mo{z}</annotation></semantics></math>'],
    /* \ms */
    ["\\ms{x}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><ms>x</ms><annotation encoding="TeX">\\ms{x}</annotation></semantics></math>'],
    /* \ms with quotes and escaped characters */
    ["\\ms[<2][&\\]x]{a&b}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><ms lquote="&lt;2" rquote="&amp;]x">a&amp;b</ms><annotation encoding="TeX">\\ms[&lt;2][&amp;\\]x]{a&amp;b}</annotation></semantics></math>'],
    /* Unknown characters (BMP and non-BMP) */
    /* | HIGH_SURROGATE LOWSURROGATE */
    /* | BMP_CHARACTER */
    ["𝀸", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext></mtext><mtext>𝀸</mtext></mrow><annotation encoding="TeX">𝀸</annotation></semantics></math>'],
    /* itex2MML compatibility note:
       \&[EntityName]; and \&[EntityNumber]; are not supported */
    /* \operatorname, \mathop, \mathbin, \mathrel */
    ["\\operatorname{x} \\mathop{x} \\mathbin{x} \\mathrel{x}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo lspace="0em" rspace="0.16666666666666666em">x</mo><mo lspace="0.16666666666666666em" rspace="0.16666666666666666em">x</mo><mo lspace="0.2222222222222222em" rspace="0.2222222222222222em">x</mo><mo lspace="0.2777777777777778em" rspace="0.2777777777777778em">x</mo></mrow><annotation encoding="TeX">\\operatorname{x} \\mathop{x} \\mathbin{x} \\mathrel{x}</annotation></semantics></math>'],
    /* \frac */
    ["\\frac x y", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mfrac><mi>x</mi><mi>y</mi></mfrac><annotation encoding="TeX">\\frac x y</annotation></semantics></math>'],
    /* \atop, \over, \choose */
    ["{x \\atop y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mfrac linethickness="0px"><mi>x</mi><mi>y</mi></mfrac><annotation encoding="TeX">{x \\atop y}</annotation></semantics></math>'],
    ["\\left( x \\atop y \\right)", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mfrac linethickness="0px"><mi>x</mi><mi>y</mi></mfrac><mo>)</mo></mrow><annotation encoding="TeX">\\left( x \\atop y \\right)</annotation></semantics></math>'],
    ["{x \\over y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mfrac><mi>x</mi><mi>y</mi></mfrac><annotation encoding="TeX">{x \\over y}</annotation></semantics></math>'],
    ["\\left( x \\over y \\right)", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mfrac><mi>x</mi><mi>y</mi></mfrac><mo>)</mo></mrow><annotation encoding="TeX">\\left( x \\over y \\right)</annotation></semantics></math>'],
    ["{x \\choose y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mfrac linethickness="0px"><mi>x</mi><mi>y</mi></mfrac><mo>)</mo></mrow><annotation encoding="TeX">{x \\choose y}</annotation></semantics></math>'],
    ["\\left[ x \\choose y \\right]", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mrow><mo>[</mo><mfrac linethickness="0px"><mi>x</mi><mi>y</mi></mfrac><mo>]</mo></mrow><mo>)</mo></mrow><annotation encoding="TeX">\\left[ x \\choose y \\right]</annotation></semantics></math>'],
    /* \root */
    ["\\root 3 x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mroot><mi>x</mi><mn>3</mn></mroot><annotation encoding="TeX">\\root 3 x</annotation></semantics></math>'],
    /* \sqrt */
    ["\\sqrt x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msqrt><mi>x</mi></msqrt><annotation encoding="TeX">\\sqrt x</annotation></semantics></math>'],
    /* \sqrt with optional parameter */
    ["\\sqrt[3]x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mroot><mi>x</mi><mn>3</mn></mroot><annotation encoding="TeX">\\sqrt[3]x</annotation></semantics></math>'],
    /* \sqrt nested optional arguments */
    ["\\sqrt[\\sqrt[\\frac{1}{2}]\\frac 3 4]\\frac 5 6", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mroot><mfrac><mn>5</mn><mn>6</mn></mfrac><mroot><mfrac><mn>3</mn><mn>4</mn></mfrac><mfrac><mn>1</mn><mn>2</mn></mfrac></mroot></mroot><annotation encoding="TeX">\\sqrt[\\sqrt[\\frac{1}{2}]\\frac 3 4]\\frac 5 6</annotation></semantics></math>'],
    /* \underset, \overset, \underoverset */
    ["\\underset{x}{y} \\overset{x}{y} \\underoverset{x}{y}{z}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><munder><mi>y</mi><mi>x</mi></munder><mover><mi>y</mi><mi>x</mi></mover><munderover><mi>z</mi><mi>x</mi><mi>y</mi></munderover></mrow><annotation encoding="TeX">\\underset{x}{y} \\overset{x}{y} \\underoverset{x}{y}{z}</annotation></semantics></math>'],
    /* \xarrow */
    ["\\xLeftarrow{x+y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mover><mo>⇐</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mover><annotation encoding="TeX">\\xLeftarrow{x+y}</annotation></semantics></math>'],
    ["\\xLeftarrow[x+y]{}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><munder><mo>⇐</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></munder><annotation encoding="TeX">\\xLeftarrow[x+y]{}</annotation></semantics></math>'],
    ["\\xLeftarrow[x+y]{a+b}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><munderover><mo>⇐</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow></munderover><annotation encoding="TeX">\\xLeftarrow[x+y]{a+b}</annotation></semantics></math>'],
    /* \xarrow */
    ["\\xrightarrow[a]{b} \\xleftarrow[a]{b} \\xleftrightarrow[a]{b} \\xLeftarrow[a]{b} \\xRightarrow[a]{b} \\xLeftrightarrow[a]{b} \\xleftrightharpoons[a]{b} \\xrightleftharpoons[a]{b} \\xhookleftarrow[a]{b} \\xhookrightarrow[a]{b} \\xmapsto[a]{b}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><munderover><mo>→</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>←</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>↔</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>⇐</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>⇒</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>⇔</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>⇋</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>⇌</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>↩</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>↪</mo><mi>a</mi><mi>b</mi></munderover><munderover><mo>↦</mo><mi>a</mi><mi>b</mi></munderover></mrow><annotation encoding="TeX">\\xrightarrow[a]{b} \\xleftarrow[a]{b} \\xleftrightarrow[a]{b} \\xLeftarrow[a]{b} \\xRightarrow[a]{b} \\xLeftrightarrow[a]{b} \\xleftrightharpoons[a]{b} \\xrightleftharpoons[a]{b} \\xhookleftarrow[a]{b} \\xhookrightarrow[a]{b} \\xmapsto[a]{b}</annotation></semantics></math>'],
    /* \math*lap */
    ["\\mathrlap{x}, \\mathllap{y}, \\mathclap{y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mpadded width="0em"><mi>x</mi></mpadded><mo>,</mo><mpadded width="0em" lspace="-100%width"><mi>y</mi></mpadded><mo>,</mo><mpadded width="0em" lspace="-50%width"><mi>y</mi></mpadded></mrow><annotation encoding="TeX">\\mathrlap{x}, \\mathllap{y}, \\mathclap{y}</annotation></semantics></math>'],
    /* itex2MML compatibility note:
       \rlap, \llap, \ulap and \dlap are not supported. */
    /* \phantom */
    ["\\phantom{x}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mphantom><mi>x</mi></mphantom><annotation encoding="TeX">\\phantom{x}</annotation></semantics></math>'],
    /* \tfrac */
    ["\\tfrac a b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mstyle displaystyle="false"><mfrac><mi>a</mi><mi>b</mi></mfrac></mstyle><annotation encoding="TeX">\\tfrac a b</annotation></semantics></math>'],
    /* \binom */
    ["\\binom a b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mfrac linethickness="0px"><mi>a</mi><mi>b</mi></mfrac><mo>)</mo></mrow><annotation encoding="TeX">\\binom a b</annotation></semantics></math>'],
    /* \tbinom */
    ["\\tbinom a b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mstyle displaystyle="false"><mfrac linethickness="0px"><mi>a</mi><mi>b</mi></mfrac></mstyle><mo>)</mo></mrow><annotation encoding="TeX">\\tbinom a b</annotation></semantics></math>'],
    /* \pmod */
    ["\\pmod a", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo lspace="0.2222222222222222em">(</mo><mo rspace="0.16666666666666666em">mod</mo><mi>a</mi><mo rspace="0.2222222222222222em">)</mo></mrow><annotation encoding="TeX">\\pmod a</annotation></semantics></math>'],
    /* \underbrace, \underline, \overbrace */
    ["\\underbrace x \\underline y \\overbrace z", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><munder><mi>x</mi><mo>⏟</mo></munder><munder><mi>y</mi><mo>_</mo></munder><mover><mi>z</mi><mo>⏞</mo></mover></mrow><annotation encoding="TeX">\\underbrace x \\underline y \\overbrace z</annotation></semantics></math>'],
    /* accents */
    ["\\widevec x \\widetilde x \\widehat x \\widecheck x \\widebar x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover><mi>x</mi><mo>⇀</mo></mover><mover><mi>x</mi><mo>˜</mo></mover><mover><mi>x</mi><mo>^</mo></mover><mover><mi>x</mi><mo>ˇ</mo></mover><mover><mi>x</mi><mo>¯</mo></mover></mrow><annotation encoding="TeX">\\widevec x \\widetilde x \\widehat x \\widecheck x \\widebar x</annotation></semantics></math>'],
    ["\\vec x \\tilde x \\overline x \\closure x \\check x \\bar x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover><mi>x</mi><mo stretchy="false">⇀</mo></mover><mover><mi>x</mi><mo stretchy="false">˜</mo></mover><mover><mi>x</mi><mo>¯</mo></mover><mover><mi>x</mi><mo>¯</mo></mover><mover><mi>x</mi><mo stretchy="false">ˇ</mo></mover><mover><mi>x</mi><mo stretchy="false">¯</mo></mover></mrow><annotation encoding="TeX">\\vec x \\tilde x \\overline x \\closure x \\check x \\bar x</annotation></semantics></math>'],
    ["\\dot x \\ddot x \\dddot x \\ddddot x ", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover><mi>x</mi><mo>˙</mo></mover><mover><mi>x</mi><mo>̈</mo></mover><mo>⃛</mo><mi>x</mi><mo>⃜</mo><mi>x</mi></mrow><annotation encoding="TeX">\\dot x \\ddot x \\dddot x \\ddddot x </annotation></semantics></math>'],
    /* \boxed */
    ["\\boxed x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><menclose notation="box"><mi>x</mi></menclose><annotation encoding="TeX">\\boxed x</annotation></semantics></math>'],
    /* \slash */
    ["\\slash x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><menclose notation="updiagonalstrike"><mi>x</mi></menclose><annotation encoding="TeX">\\slash x</annotation></semantics></math>'],
    /* \quad, \qquad */
    ["\\quad \\qquad", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mspace width="1em"/><mspace width="2em"/></mrow><annotation encoding="TeX">\\quad \\qquad</annotation></semantics></math>'],
    /* spaces */
    ["\\! \\, \\: \\; \\medspace \\negspace \\negmedspace \\negthickspace \\thickspace \\thinspace", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mspace width="0em"/><mspace width="0.16666666666666666em"/><mspace width="0.2222222222222222em"/><mspace width="0.2777777777777778em"/><mspace width="0.2222222222222222em"/><mspace width="0em"/><mspace width="-0.2222222222222222em"/><mspace width="-0.16666666666666666em"/><mspace width="0.2777777777777778em"/><mspace width="0.16666666666666666em"/></mrow><annotation encoding="TeX">\\! \\, \\: \\; \\medspace \\negspace \\negmedspace \\negthickspace \\thickspace \\thinspace</annotation></semantics></math>'],
    /* space */
    ["\\space{1}{2}{3}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mspace height=".1ex" depth=".2ex" width=".3em"/><annotation encoding="TeX">\\space{1}{2}{3}</annotation></semantics></math>'],
    /* mathraisebox */
    ["\\mathraisebox{1em}x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="1em" height="+1em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{1em}x</annotation></semantics></math>'],
    ["\\mathraisebox{-1em}x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="-1em" height="0pt" depth="+1em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{-1em}x</annotation></semantics></math>'],
    ["\\mathraisebox{1em}[2em]x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="1em" height="2em" depth="depth"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{1em}[2em]x</annotation></semantics></math>'],
    ["\\mathraisebox{-1em}[2em]x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="-1em" height="2em" depth="+1em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{-1em}[2em]x</annotation></semantics></math>'],
    ["\\mathraisebox{1em}[2em][3em]x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="1em" height="2em" depth="3em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{1em}[2em][3em]x</annotation></semantics></math>'],
    /* ParseLength: invalid, namedspace, unitless */
    ["\\mathraisebox{invalid}x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mpadded voffset="0em" height="+0em"><mi>x</mi></mpadded><annotation encoding="TeX">\\mathraisebox{invalid}x</annotation></semantics></math>'],
    ["\\mathraisebox{2}x, \\mathraisebox{-2}x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mpadded voffset="200%" height="+200%"><mi>x</mi></mpadded><mo>,</mo><mpadded voffset="-200%" height="0pt" depth="+200%"><mi>x</mi></mpadded></mrow><annotation encoding="TeX">\\mathraisebox{2}x, \\mathraisebox{-2}x</annotation></semantics></math>'],
    ["\\mathraisebox{negativeveryverythinmathspace}x \\mathraisebox{negativeverythinmathspace}x \\mathraisebox{negativemediummathspace}x \\mathraisebox{negativethickmathspace}x \\mathraisebox{negativeverythickmathspace}x \\mathraisebox{negativeveryverythickmathspace}x \\mathraisebox{veryverythinmathspace}x \\mathraisebox{verythinmathspace}x \\mathraisebox{thinmathspace}x \\mathraisebox{mediummathspace}x \\mathraisebox{thickmathspace}x \\mathraisebox{verythickmathspace}x \\mathraisebox{veryverythickmathspac}x", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mpadded voffset="-0.3333333333333333em" height="0pt" depth="+0.3333333333333333em"><mi>x</mi></mpadded><mpadded voffset="-0.2777777777777778em" height="0pt" depth="+0.2777777777777778em"><mi>x</mi></mpadded><mpadded voffset="-0.2222222222222222em" height="0pt" depth="+0.2222222222222222em"><mi>x</mi></mpadded><mpadded voffset="-0.16666666666666666em" height="0pt" depth="+0.16666666666666666em"><mi>x</mi></mpadded><mpadded voffset="-0.1111111111111111em" height="0pt" depth="+0.1111111111111111em"><mi>x</mi></mpadded><mpadded voffset="-0.05555555555555555em" height="0pt" depth="+0.05555555555555555em"><mi>x</mi></mpadded><mpadded voffset="0.05555555555555555em" height="+0.05555555555555555em"><mi>x</mi></mpadded><mpadded voffset="0.1111111111111111em" height="+0.1111111111111111em"><mi>x</mi></mpadded><mpadded voffset="0.16666666666666666em" height="+0.16666666666666666em"><mi>x</mi></mpadded><mpadded voffset="0.2222222222222222em" height="+0.2222222222222222em"><mi>x</mi></mpadded><mpadded voffset="0.2777777777777778em" height="+0.2777777777777778em"><mi>x</mi></mpadded><mpadded voffset="0.3333333333333333em" height="+0.3333333333333333em"><mi>x</mi></mpadded><mpadded voffset="0em" height="+0em"><mi>x</mi></mpadded></mrow><annotation encoding="TeX">\\mathraisebox{negativeveryverythinmathspace}x \\mathraisebox{negativeverythinmathspace}x \\mathraisebox{negativemediummathspace}x \\mathraisebox{negativethickmathspace}x \\mathraisebox{negativeverythickmathspace}x \\mathraisebox{negativeveryverythickmathspace}x \\mathraisebox{veryverythinmathspace}x \\mathraisebox{verythinmathspace}x \\mathraisebox{thinmathspace}x \\mathraisebox{mediummathspace}x \\mathraisebox{thickmathspace}x \\mathraisebox{verythickmathspace}x \\mathraisebox{veryverythickmathspac}x</annotation></semantics></math>'],
    /* mathvariant, single char mi */
    ["\\mathbb{x} \\mathbf{x} \\mathbit{x} \\mathscr{x} \\mathcal{x} \\mathbscr{x} \\mathsf{x} \\mathfrak{x} \\mathit{x} \\mathtt{x} \\mathrm{x}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>𝕩</mi><mi>𝐱</mi><mi>𝒙</mi><mi>𝓍</mi><mi>𝓍</mi><mi>𝔁</mi><mi>𝗑</mi><mi>𝔵</mi><mi>𝑥</mi><mi>𝚡</mi><mi mathvariant="normal">x</mi></mrow><annotation encoding="TeX">\\mathbb{x} \\mathbf{x} \\mathbit{x} \\mathscr{x} \\mathcal{x} \\mathbscr{x} \\mathsf{x} \\mathfrak{x} \\mathit{x} \\mathtt{x} \\mathrm{x}</annotation></semantics></math>'],
    /* mathvariant, single char mtext */
    ["\\mathbb\\mtext{x} \\mathbf\\mtext{x} \\mathbit\\mtext{x} \\mathscr\\mtext{x} \\mathcal\\mtext{x} \\mathbscr\\mtext{x} \\mathsf\\mtext{x} \\mathfrak\\mtext{x} \\mathit\\mtext{x} \\mathtt\\mtext{x} \\mathrm\\mtext{x}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>𝕩</mtext><mtext>𝐱</mtext><mtext>𝒙</mtext><mtext>𝓍</mtext><mtext>𝓍</mtext><mtext>𝔁</mtext><mtext>𝗑</mtext><mtext>𝔵</mtext><mtext>𝑥</mtext><mtext>𝚡</mtext><mtext>x</mtext></mrow><annotation encoding="TeX">\\mathbb\\mtext{x} \\mathbf\\mtext{x} \\mathbit\\mtext{x} \\mathscr\\mtext{x} \\mathcal\\mtext{x} \\mathbscr\\mtext{x} \\mathsf\\mtext{x} \\mathfrak\\mtext{x} \\mathit\\mtext{x} \\mathtt\\mtext{x} \\mathrm\\mtext{x}</annotation></semantics></math>'],
    /* mathvariant, multiple char mi */
    ["\\mathbb\\mi{xy} \\mathbf\\mi{xy} \\mathnit\\mi{xy} \\mathscr\\mi{xy} \\mathcal\\mi{xy} \\mathbscr\\mi{xy} \\mathsf\\mi{xy} \\mathfrak\\mi{xy} \\mathit\\mi{xy} \\mathtt\\mi{xy} \\mathrm\\mi{xy}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>𝕩𝕪</mi><mi>𝐱𝐲</mi><mtext>\\</mtext><mi>m</mi><mi>a</mi><mi>t</mi><mi>h</mi><mi>n</mi><mi>i</mi><mi>t</mi><mi>xy</mi><mi>𝓍𝓎</mi><mi>𝓍𝓎</mi><mi>𝔁𝔂</mi><mi>𝗑𝗒</mi><mi>𝔵𝔶</mi><mi>𝑥𝑦</mi><mi>𝚡𝚢</mi><mi>xy</mi></mrow><annotation encoding="TeX">\\mathbb\\mi{xy} \\mathbf\\mi{xy} \\mathnit\\mi{xy} \\mathscr\\mi{xy} \\mathcal\\mi{xy} \\mathbscr\\mi{xy} \\mathsf\\mi{xy} \\mathfrak\\mi{xy} \\mathit\\mi{xy} \\mathtt\\mi{xy} \\mathrm\\mi{xy}</annotation></semantics></math>'],
    /* mathvariant, multiple tokens */
    ["\\mathbb{x+y} \\mathbf{x+y} \\mathbit{x+y} \\mathscr{x+y} \\mathcal{x+y} \\mathbscr{x+y} \\mathsf{x+y} \\mathfrak{x+y} \\mathit{x+y} \\mathtt{x+y} \\mathrm{x+y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mstyle mathvariant="double-struck"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="bold"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="bold-italic"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="script"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="script"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="bold-script"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="sans-serif"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="fraktur"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="italic"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="monospace"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle><mstyle mathvariant="normal"><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow></mstyle></mrow><annotation encoding="TeX">\\mathbb{x+y} \\mathbf{x+y} \\mathbit{x+y} \\mathscr{x+y} \\mathcal{x+y} \\mathbscr{x+y} \\mathsf{x+y} \\mathfrak{x+y} \\mathit{x+y} \\mathtt{x+y} \\mathrm{x+y}</annotation></semantics></math>'],
    /* mathvariant, nested expressions */
    ["\\mathbb\\frac{x}{y} \\mathbf\\frac{x}{y} \\mathbit\\frac{x}{y} \\mathscr\\frac{x}{y} \\mathcal\\frac{x}{y} \\mathbscr\\frac{x}{y} \\mathsf\\frac{x}{y} \\mathfrak\\frac{x}{y} \\mathit\\frac{x}{y} \\mathtt\\frac{x}{y} \\mathrm\\frac{x}{y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mstyle mathvariant="double-struck"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="bold"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="bold-italic"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="script"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="script"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="bold-script"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="sans-serif"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="fraktur"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="italic"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="monospace"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle><mstyle mathvariant="normal"><mfrac><mi>x</mi><mi>y</mi></mfrac></mstyle></mrow><annotation encoding="TeX">\\mathbb\\frac{x}{y} \\mathbf\\frac{x}{y} \\mathbit\\frac{x}{y} \\mathscr\\frac{x}{y} \\mathcal\\frac{x}{y} \\mathbscr\\frac{x}{y} \\mathsf\\frac{x}{y} \\mathfrak\\frac{x}{y} \\mathit\\frac{x}{y} \\mathtt\\frac{x}{y} \\mathrm\\frac{x}{y}</annotation></semantics></math>'],
    /* mathvariant, latin */
    ["\\mathbb\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ</mtext><annotation encoding="TeX">\\mathbb\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    ["\\mathbf\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙</mtext><annotation encoding="TeX">\\mathbf\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    ["\\mathbit\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁</mtext><annotation encoding="TeX">\\mathbit\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    ["\\mathscr\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵</mtext><annotation encoding="TeX">\\mathscr\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    ["\\mathbscr\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩</mtext><annotation encoding="TeX">\\mathbscr\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    ["\\mathsf\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹</mtext><annotation encoding="TeX">\\mathsf\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    ["\\mathfrak\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ</mtext><annotation encoding="TeX">\\mathfrak\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    ["\\mathit\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍</mtext><annotation encoding="TeX">\\mathit\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    ["\\mathtt\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉</mtext><annotation encoding="TeX">\\mathtt\\mtext{abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ}</annotation></semantics></math>'],
    /* mathvariant, digits */
    ["\\mathbb\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡</mtext><annotation encoding="TeX">\\mathbb\\mtext{0123456789}</annotation></semantics></math>'],
    ["\\mathbf\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗</mtext><annotation encoding="TeX">\\mathbf\\mtext{0123456789}</annotation></semantics></math>'],
    ["\\mathbit\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>0123456789</mtext><annotation encoding="TeX">\\mathbit\\mtext{0123456789}</annotation></semantics></math>'],
    ["\\mathscr\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>0123456789</mtext><annotation encoding="TeX">\\mathscr\\mtext{0123456789}</annotation></semantics></math>'],
    ["\\mathbscr\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>0123456789</mtext><annotation encoding="TeX">\\mathbscr\\mtext{0123456789}</annotation></semantics></math>'],
    ["\\mathsf\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫</mtext><annotation encoding="TeX">\\mathsf\\mtext{0123456789}</annotation></semantics></math>'],
    ["\\mathfrak\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>0123456789</mtext><annotation encoding="TeX">\\mathfrak\\mtext{0123456789}</annotation></semantics></math>'],
    ["\\mathit\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>0123456789</mtext><annotation encoding="TeX">\\mathit\\mtext{0123456789}</annotation></semantics></math>'],
    ["\\mathtt\\mtext{0123456789}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtext>𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿</mtext><annotation encoding="TeX">\\mathtt\\mtext{0123456789}</annotation></semantics></math>'],
    /* FIXME: add mathvariant tests for greek, arabic and exceptions */
    /* See https://github.com/fred-wang/TeXZilla/issues/65 */
    /* \href */
    ["\\href{http://www.myurl.org}{\\frac a b}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow href="http://www.myurl.org"><mfrac><mi>a</mi><mi>b</mi></mfrac></mrow><annotation encoding="TeX">\\href{http://www.myurl.org}{\\frac a b}</annotation></semantics></math>'],
    /* maction */
    ["\\statusline{a}b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><maction actiontype="statusline"><mi>b</mi><mtext>a</mtext></maction><annotation encoding="TeX">\\statusline{a}b</annotation></semantics></math>'],
    ["\\tooltip{a}b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><maction actiontype="tooltip"><mi>b</mi><mtext>a</mtext></maction><annotation encoding="TeX">\\tooltip{a}b</annotation></semantics></math>'],
    ["\\toggle a b", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><maction actiontype="toggle" selection="2"><mi>a</mi><mi>b</mi></maction><annotation encoding="TeX">\\toggle a b</annotation></semantics></math>'],
    ["\\begintoggle a b c \\endtoggle", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><maction actiontype="toggle"><mi>a</mi><mi>b</mi><mi>c</mi></maction><annotation encoding="TeX">\\begintoggle a b c \\endtoggle</annotation></semantics></math>'],
    /* itex2MML compatibility note:
       \fghilight, \fghighlight, \bghilight, and \bghighlight are not
       supported */
    /* tensor */
    ["\\tensor x_b^c_d^e_^f", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><mi>b</mi><mi>c</mi><mi>d</mi><mi>e</mi><none/><mi>f</mi></mmultiscripts><annotation encoding="TeX">\\tensor x_b^c_d^e_^f</annotation></semantics></math>'],
    ["\\tensor x{_b^c_d^e_^f}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><mi>b</mi><mi>c</mi><mi>d</mi><mi>e</mi><none/><mi>f</mi></mmultiscripts><annotation encoding="TeX">\\tensor x{_b^c_d^e_^f}</annotation></semantics></math>'],
    /* multiscripts */
    ["\\multiscripts{ }x{^1_2_3^4_^5}",'<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><none/><mn>1</mn><mn>2</mn><none/><mn>3</mn><mn>4</mn><none/><mn>5</mn></mmultiscripts><annotation encoding="TeX">\\multiscripts{ }x{^1_2_3^4_^5}</annotation></semantics></math>'],
    ["\\multiscripts{^1_2_3^4_^5}x{ }",'<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><mprescripts/><none/><mn>1</mn><mn>2</mn><none/><mn>3</mn><mn>4</mn><none/><mn>5</mn></mmultiscripts><annotation encoding="TeX">\\multiscripts{^1_2_3^4_^5}x{ }</annotation></semantics></math>'],
    ["\\multiscripts{^1_2_3^4_^5}x{^1_2_3^4_^5}",'<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mmultiscripts><mi>x</mi><none/><mn>1</mn><mn>2</mn><none/><mn>3</mn><mn>4</mn><none/><mn>5</mn><mprescripts/><none/><mn>1</mn><mn>2</mn><none/><mn>3</mn><mn>4</mn><none/><mn>5</mn></mmultiscripts><annotation encoding="TeX">\\multiscripts{^1_2_3^4_^5}x{^1_2_3^4_^5}</annotation></semantics></math>'],
    /* matrix */
    ["\\begin{matrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{matrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{matrix}</annotation></semantics></math>'],
    /* pmatrix */
    ["\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>(</mo><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><mo>)</mo></mrow><annotation encoding="TeX">\\begin{pmatrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{pmatrix}</annotation></semantics></math>'],
    /* bmatrix */
    ["\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>[</mo><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><mo>]</mo></mrow><annotation encoding="TeX">\\begin{bmatrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{bmatrix}</annotation></semantics></math>'],
    /* Bmatrix */
    ["\\begin{Bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{Bmatrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>{</mo><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><mo>}</mo></mrow><annotation encoding="TeX">\\begin{Bmatrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{Bmatrix}</annotation></semantics></math>'],
    /* vmatrix */
    ["\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>|</mo><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><mo>|</mo></mrow><annotation encoding="TeX">\\begin{vmatrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{vmatrix}</annotation></semantics></math>'],
    /* Vmatrix */
    ["\\begin{Vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{Vmatrix}",
     '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>‖</mo><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><mo>‖</mo></mrow><annotation encoding="TeX">\\begin{Vmatrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{Vmatrix}</annotation></semantics></math>'],
    /* array */
    ["\\begin{array}{clr} a & b & c \\\\ d & e & f \\end{array}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false" rowspacing="0.5ex" columnalign="center left right"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{array}{clr} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\end{array}</annotation></semantics></math>'],
    ["\\begin{array}[c]{clr} a & b & c \\\\ d & e & f \\end{array}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false" rowspacing="0.5ex" align="center" columnalign="center left right"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{array}[c]{clr} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\end{array}</annotation></semantics></math>'],
    ["\\begin{array}[t]{clr} a & b & c \\\\ d & e & f \\end{array}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false" rowspacing="0.5ex" align="axis 1" columnalign="center left right"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{array}[t]{clr} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\end{array}</annotation></semantics></math>'],
    ["\\begin{array}[b]{clr} a & b & c \\\\ d & e & f \\end{array}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false" rowspacing="0.5ex" align="axis -1" columnalign="center left right"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{array}[b]{clr} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\end{array}</annotation></semantics></math>'],
   /* rowopts */
   ["\\begin{matrix}\\rowopts{\\colalign{left right}\\rowalign{top bottom}} a & b \\\\ \\rowopts{\\rowalign{bottom top}\\colalign{right left}} c & d \\end{matrix}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false" rowspacing="0.5ex"><mtr columnalign="left right" rowalign="top bottom"><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd></mtr><mtr rowalign="bottom top" columnalign="right left"><mtd><mi>c</mi></mtd><mtd><mi>d</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix}\\rowopts{\\colalign{left right}\\rowalign{top bottom}} a &amp; b \\\\ \\rowopts{\\rowalign{bottom top}\\colalign{right left}} c &amp; d \\end{matrix}</annotation></semantics></math>'],
  /* cellopts align */
  ["\\begin{matrix} \\cellopts{\\colalign{left}\\rowalign{top}} a & \\cellopts{\\rowalign{bottom}\\colalign{right}} b \\end{matrix}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd columnalign="left" rowalign="top"><mi>a</mi></mtd><mtd rowalign="bottom" columnalign="right"><mi>b</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix} \\cellopts{\\colalign{left}\\rowalign{top}} a &amp; \\cellopts{\\rowalign{bottom}\\colalign{right}} b \\end{matrix}</annotation></semantics></math>'],
  /* cellopts span */
  ["\\begin{matrix} \\cellopts{\\rowspan{2}\\colspan{3}} a & \\\\ & b & c \\end{matrix}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd rowspan="2" colspan="3"><mi>a</mi></mtd><mtd></mtd></mtr><mtr><mtd></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{matrix} \\cellopts{\\rowspan{2}\\colspan{3}} a &amp; \\\\ &amp; b &amp; c \\end{matrix}</annotation></semantics></math>'],
  /* array */
  ["\\array{ a & b \\\\ c & d }", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="false"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd></mtr><mtr><mtd><mi>c</mi></mtd><mtd><mi>d</mi></mtd></mtr></mtable><annotation encoding="TeX">\\array{ a &amp; b \\\\ c &amp; d }</annotation></semantics></math>'],
    ["\\array{ \\arrayopts{\\colalign{left right right}\\rowalign{top bottom bottom}\\align{center}\\padding{1em}\\equalrows{true}\\equalcols{true}\\rowlines{dashed}\\collines{dashed}\\frame{solid}} a & b & c}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable columnalign="left right right" rowalign="top bottom bottom" align="center" rowspacing="1em" columnspacing="1em" equalrows="true" equalcolumns="true" rowlines="dashed" columnlines="dashed" frame="solid" displaystyle="false"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr></mtable><annotation encoding="TeX">\\array{ \\arrayopts{\\colalign{left right right}\\rowalign{top bottom bottom}\\align{center}\\padding{1em}\\equalrows{true}\\equalcols{true}\\rowlines{dashed}\\collines{dashed}\\frame{solid}} a &amp; b &amp; c}</annotation></semantics></math>'],
    ["\\array{ \\arrayopts{\\collayout{left right right}\\rowalign{top bottom bottom}\\align{center}\\padding{1em}\\equalrows{true}\\equalcols{true}\\rowlines{dashed}\\collines{dashed}\\frame{solid}} a & b & c}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable columnalign="left right right" rowalign="top bottom bottom" align="center" rowspacing="1em" columnspacing="1em" equalrows="true" equalcolumns="true" rowlines="dashed" columnlines="dashed" frame="solid" displaystyle="false"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr></mtable><annotation encoding="TeX">\\array{ \\arrayopts{\\collayout{left right right}\\rowalign{top bottom bottom}\\align{center}\\padding{1em}\\equalrows{true}\\equalcols{true}\\rowlines{dashed}\\collines{dashed}\\frame{solid}} a &amp; b &amp; c}</annotation></semantics></math>'],
    /* collayout+colalign does not generate duplicate columnalign attributes */
    ["\\array{ \\arrayopts{\\collayout{left right}\\colalign{right left}} a & b }", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable columnalign="right left" displaystyle="false"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd></mtr></mtable><annotation encoding="TeX">\\array{ \\arrayopts{\\collayout{left right}\\colalign{right left}} a &amp; b }</annotation></semantics></math>'],
    /* gathered */
    ["\\begin{gathered} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{gathered}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="true" rowspacing="1.0ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{gathered} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{gathered}</annotation></semantics></math>'],
    /* smallmatrix */
    ["\\begin{smallmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{smallmatrix}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mstyle scriptlevel="2"><mtable displaystyle="false" rowspacing="0.5ex"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable></mstyle><annotation encoding="TeX">\\begin{smallmatrix} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{smallmatrix}</annotation></semantics></math>'],
    /* cases */
    ["\\begin{cases} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{cases}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>{</mo><mtable displaystyle="false" columnalign="left left"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable></mrow><annotation encoding="TeX">\\begin{cases} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{cases}</annotation></semantics></math>'],
    /* aligned */
    ["\\begin{aligned} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{aligned}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="true" columnalign="right left right left right left right left right left" columnspacing="0em"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{aligned} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{aligned}</annotation></semantics></math>'],
    /* split */
    ["\\begin{split} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{split}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mtable displaystyle="true" columnalign="right left right left right left right left right left" columnspacing="0em"><mtr><mtd><mi>a</mi></mtd><mtd><mi>b</mi></mtd><mtd><mi>c</mi></mtd></mtr><mtr><mtd><mi>d</mi></mtd><mtd><mi>e</mi></mtd><mtd><mi>f</mi></mtd></mtr><mtr><mtd><mi>g</mi></mtd><mtd><mi>h</mi></mtd><mtd><mi>i</mi></mtd></mtr></mtable><annotation encoding="TeX">\\begin{split} a &amp; b &amp; c \\\\ d &amp; e &amp; f \\\\ g &amp; h &amp; i \\end{split}</annotation></semantics></math>'],
    /* itex2MML compatibility note:
       \begin{svg} ... \end{svg} and \includegraphics are not supported
       "&amp;" can not be used as a colsep */
    /* colors */
    ["{\\color{aqua} x} {\\color{#ff00ff} y} {\\bgcolor{aqua} x} {\\bgcolor{#ff00ff} y}", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathcolor="aqua">x</mi><mi mathcolor="#ff00ff">y</mi><mi mathbackground="aqua">x</mi><mi mathbackground="#ff00ff">y</mi></mrow><annotation encoding="TeX">{\\color{aqua} x} {\\color{#ff00ff} y} {\\bgcolor{aqua} x} {\\bgcolor{#ff00ff} y}</annotation></semantics></math>'],

    /**** Various char commands ****/
    /* Greek letters */
    ["\\alpha \\beta \\gamma \\delta \\zeta \\eta \\theta \\iota \\kappa \\lambda \\mu \\nu \\xi \\pi \\rho \\sigma \\tau \\upsilon \\chi \\psi \\omega \\backepsilon \\varkappa \\varpi \\varrho \\varsigma \\vartheta \\varepsilon \\phi \\varphi", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mi>β</mi><mi>γ</mi><mi>δ</mi><mi>ζ</mi><mi>η</mi><mi>θ</mi><mi>ι</mi><mi>κ</mi><mi>λ</mi><mi>μ</mi><mi>ν</mi><mi>ξ</mi><mi>π</mi><mi>ρ</mi><mi>σ</mi><mi>τ</mi><mi>υ</mi><mi>χ</mi><mi>ψ</mi><mi>ω</mi><mo>϶</mo><mi>ϰ</mi><mi>ϖ</mi><mi>ϱ</mi><mi>ς</mi><mi>ϑ</mi><mi>ε</mi><mi>ϕ</mi><mi>φ</mi></mrow><annotation encoding="TeX">\\alpha \\beta \\gamma \\delta \\zeta \\eta \\theta \\iota \\kappa \\lambda \\mu \\nu \\xi \\pi \\rho \\sigma \\tau \\upsilon \\chi \\psi \\omega \\backepsilon \\varkappa \\varpi \\varrho \\varsigma \\vartheta \\varepsilon \\phi \\varphi</annotation></semantics></math>'],
    ["\\Alpha \\Beta \\Delta \\Gamma \\digamma \\Lambda \\Pi \\Phi \\Psi \\Sigma \\Theta \\Xi \\Zeta \\Eta \\Iota \\Kappa \\Mu \\Nu \\Rho \\Tau \\mho \\Omega \\Upsilon \\Upsi", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Α</mi><mi>Β</mi><mi>Δ</mi><mi>Γ</mi><mi>ϝ</mi><mi>Λ</mi><mi>Π</mi><mi>Φ</mi><mi>Ψ</mi><mi>Σ</mi><mi>Θ</mi><mi>Ξ</mi><mi>Ζ</mi><mi>Η</mi><mi>Ι</mi><mi>Κ</mi><mi>Μ</mi><mi>Ν</mi><mi>Ρ</mi><mi>Τ</mi><mi>℧</mi><mi>Ω</mi><mi>ϒ</mi><mi>ϒ</mi></mrow><annotation encoding="TeX">\\Alpha \\Beta \\Delta \\Gamma \\digamma \\Lambda \\Pi \\Phi \\Psi \\Sigma \\Theta \\Xi \\Zeta \\Eta \\Iota \\Kappa \\Mu \\Nu \\Rho \\Tau \\mho \\Omega \\Upsilon \\Upsi</annotation></semantics></math>'],
    ["ΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσΤτυΦφΧχΨψΩω", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Α</mi><mi>α</mi><mi>Β</mi><mi>β</mi><mi>Γ</mi><mi>γ</mi><mi>Δ</mi><mi>δ</mi><mi>Ε</mi><mi>ε</mi><mi>Ζ</mi><mi>ζ</mi><mi>Η</mi><mi>η</mi><mi>Θ</mi><mi>θ</mi><mi>Ι</mi><mi>ι</mi><mi>Κ</mi><mi>κ</mi><mi>Λ</mi><mi>λ</mi><mi>Μ</mi><mi>μ</mi><mi>Ν</mi><mi>ν</mi><mi>Ξ</mi><mi>ξ</mi><mi>Ο</mi><mi>ο</mi><mi>Π</mi><mi>π</mi><mi>Ρ</mi><mi>ρ</mi><mi>Σ</mi><mi>σ</mi><mi>Τ</mi><mi>τ</mi><mi>υ</mi><mi>Φ</mi><mi>φ</mi><mi>Χ</mi><mi>χ</mi><mi>Ψ</mi><mi>ψ</mi><mi>Ω</mi><mi>ω</mi></mrow><annotation encoding="TeX">ΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσΤτυΦφΧχΨψΩω</annotation></semantics></math>'],
  /* infinity */
  ["\\infty \\infinity ∞", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>∞</mn><mn>∞</mn><mn>∞</mn></mrow><annotation encoding="TeX">\\infty \\infinity ∞</annotation></semantics></math>'],
  /* char commands */
  ["( [ ) ] \\lbrace \\{ \\rbrace \\} \\vert | \\Vert \\| \\setminus \\backslash \\smallsetminus \\sslash \\lfloor \\lceil \\lmoustache \\lang \\langle \\llangle \\rceil \\rmoustache \\rang \\rangle \\rrangle / \\uparrow \\downarrow \\updownarrow", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mo stretchy="false">[</mo><mo stretchy="false">)</mo><mo stretchy="false">]</mo><mo stretchy="false">{</mo><mo stretchy="false">{</mo><mo stretchy="false">}</mo><mo stretchy="false">}</mo><mo stretchy="false">|</mo><mo stretchy="false">|</mo><mo stretchy="false">‖</mo><mo stretchy="false">‖</mo><mo>∖</mo><mo>\\</mo><mo>∖</mo><mo>⫽</mo><mo stretchy="false">⌊</mo><mo stretchy="false">⌈</mo><mo>⎰</mo><mo stretchy="false">⟨</mo><mo stretchy="false">⟨</mo><mo stretchy="false">⟪</mo><mo stretchy="false">⌉</mo><mo>⎱</mo><mo stretchy="false">⟩</mo><mo stretchy="false">⟩</mo><mo stretchy="false">⟫</mo><mo>/</mo><mo stretchy="false">↑</mo><mo stretchy="false">↓</mo><mo stretchy="false">↕</mo></mrow><annotation encoding="TeX">( [ ) ] \\lbrace \\{ \\rbrace \\} \\vert | \\Vert \\| \\setminus \\backslash \\smallsetminus \\sslash \\lfloor \\lceil \\lmoustache \\lang \\langle \\llangle \\rceil \\rmoustache \\rang \\rangle \\rrangle / \\uparrow \\downarrow \\updownarrow</annotation></semantics></math>'],
  /* char commands */
  [". - + \\# , : ! = ~ ; ? # ` *", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>.</mo><mo>-</mo><mo>+</mo><mo>#</mo><mo>,</mo><mo>:</mo><mo>!</mo><mo>=</mo><mo stretchy="false">~</mo><mo>;</mo><mo>?</mo><mo>#</mo><mo>`</mo><mo>*</mo></mrow><annotation encoding="TeX">. - + \\# , : ! = ~ ; ? # ` *</annotation></semantics></math>'],
  /* primes */
  ["f\\prime f' f'' f''' f'''' f\\backprime", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>f</mi><mo>′</mo></msup><msup><mi>f</mi><mo>′</mo></msup><msup><mi>f</mi><mo>″</mo></msup><msup><mi>f</mi><mo>‴</mo></msup><msup><mi>f</mi><mo>⁗</mo></msup><msup><mi>f</mi><mo>‵</mo></msup></mrow><annotation encoding="TeX">f\\prime f\' f\'\' f\'\'\' f\'\'\'\' f\\backprime</annotation></semantics></math>'],
  /* char commands */
  ["\\omicron \\epsilon \\cdot", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ℴ</mi><mi>ϵ</mi><mo>⋅</mo></mrow><annotation encoding="TeX">\\omicron \\epsilon \\cdot</annotation></semantics></math>'],

    /* arrows */
    ["\\iff \\Longleftrightarrow \\Leftrightarrow \\impliedby \\Leftarrow \\implies \\Rightarrow \\hookleftarrow \\embedsin \\hookrightarrow \\longleftarrow \\longrightarrow \\leftarrow \\to \\rightarrow \\leftrightarrow \\mapsto \\map \\nearrow \\nearr \\nwarrow \\nwarr \\searrow \\searr \\swarrow \\swarr \\neArrow \\neArr \\nwArrow \\nwArr \\seArrow \\seArr \\swArrow \\swArr", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">⟺</mo><mo stretchy="false">⟺</mo><mo stretchy="false">⇔</mo><mo stretchy="false">⇐</mo><mo stretchy="false">⇐</mo><mo stretchy="false">⇒</mo><mo stretchy="false">⇒</mo><mo stretchy="false">↩</mo><mo stretchy="false">↪</mo><mo stretchy="false">↪</mo><mo stretchy="false">⟵</mo><mo stretchy="false">⟶</mo><mo stretchy="false">←</mo><mo stretchy="false">→</mo><mo stretchy="false">→</mo><mo stretchy="false">↔</mo><mo stretchy="false">↦</mo><mo stretchy="false">↦</mo><mo stretchy="false">↗</mo><mo stretchy="false">↗</mo><mo stretchy="false">↖</mo><mo stretchy="false">↖</mo><mo stretchy="false">↘</mo><mo stretchy="false">↘</mo><mo stretchy="false">↙</mo><mo stretchy="false">↙</mo><mo stretchy="false">⇗</mo><mo stretchy="false">⇗</mo><mo stretchy="false">⇖</mo><mo stretchy="false">⇖</mo><mo stretchy="false">⇘</mo><mo stretchy="false">⇘</mo><mo stretchy="false">⇙</mo><mo stretchy="false">⇙</mo></mrow><annotation encoding="TeX">\\iff \\Longleftrightarrow \\Leftrightarrow \\impliedby \\Leftarrow \\implies \\Rightarrow \\hookleftarrow \\embedsin \\hookrightarrow \\longleftarrow \\longrightarrow \\leftarrow \\to \\rightarrow \\leftrightarrow \\mapsto \\map \\nearrow \\nearr \\nwarrow \\nwarr \\searrow \\searr \\swarrow \\swarr \\neArrow \\neArr \\nwArrow \\nwArr \\seArrow \\seArr \\swArrow \\swArr</annotation></semantics></math>'],

    /* arrows */
    ["\\darr \\Downarrow \\uparr \\Uparrow \\downuparrow \\duparr \\updarr \\Updownarrow \\leftsquigarrow \\rightsquigarrow \\dashleftarrow \\dashrightarrow \\curvearrowbotright \\righttoleftarrow \\lefttorightarrow \\leftrightsquigarrow \\upuparrows \\rightleftarrows \\rightrightarrows", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">↓</mo><mo stretchy="false">⇓</mo><mo stretchy="false">↑</mo><mo stretchy="false">⇑</mo><mo stretchy="false">↕</mo><mo stretchy="false">↕</mo><mo stretchy="false">↕</mo><mo stretchy="false">⇕</mo><mo stretchy="false">↜</mo><mo stretchy="false">↝</mo><mo stretchy="false">⤎</mo><mo stretchy="false">⤏</mo><mo>⤻</mo><mo>⟲</mo><mo>⟳</mo><mo stretchy="false">↭</mo><mo stretchy="false">⇈</mo><mo stretchy="false">⇄</mo><mo stretchy="false">⇉</mo></mrow><annotation encoding="TeX">\\darr \\Downarrow \\uparr \\Uparrow \\downuparrow \\duparr \\updarr \\Updownarrow \\leftsquigarrow \\rightsquigarrow \\dashleftarrow \\dashrightarrow \\curvearrowbotright \\righttoleftarrow \\lefttorightarrow \\leftrightsquigarrow \\upuparrows \\rightleftarrows \\rightrightarrows</annotation></semantics></math>'],

    /* arrows */
    ["\\curvearrowleft \\curvearrowright \\downdownarrows \\leftarrowtail \\rightarrowtail \\leftleftarrows \\leftrightarrows \\Lleftarrow \\Rrightarrow \\looparrowleft \\looparrowright \\Lsh \\Rsh \\circlearrowleft \\circlearrowright \\twoheadleftarrow \\twoheadrightarrow \\nLeftarrow \\nleftarrow \\nLeftrightarrow \\nleftrightarrow \\nRightarrow \\nrightarrow", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>↶</mo><mo>↷</mo><mo stretchy="false">⇊</mo><mo stretchy="false">↢</mo><mo stretchy="false">↣</mo><mo stretchy="false">⇇</mo><mo stretchy="false">⇆</mo><mo stretchy="false">⇚</mo><mo stretchy="false">⇛</mo><mo stretchy="false">↫</mo><mo stretchy="false">↬</mo><mo stretchy="false">↰</mo><mo stretchy="false">↱</mo><mo>⥀</mo><mo>⥁</mo><mo stretchy="false">↞</mo><mo stretchy="false">↠</mo><mo>⇍</mo><mo>↚</mo><mo>⇎</mo><mo>↮</mo><mo>⇏</mo><mo>↛</mo></mrow><annotation encoding="TeX">\\curvearrowleft \\curvearrowright \\downdownarrows \\leftarrowtail \\rightarrowtail \\leftleftarrows \\leftrightarrows \\Lleftarrow \\Rrightarrow \\looparrowleft \\looparrowright \\Lsh \\Rsh \\circlearrowleft \\circlearrowright \\twoheadleftarrow \\twoheadrightarrow \\nLeftarrow \\nleftarrow \\nLeftrightarrow \\nleftrightarrow \\nRightarrow \\nrightarrow</annotation></semantics></math>'],

    /* arrows */
    ["\\rightharpoonup \\rightharpoondown \\leftharpoonup \\leftharpoondown \\downharpoonleft \\downharpoonright \\leftrightharpoons \\rightleftharpoons \\upharpoonleft \\upharpoonright", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">⇀</mo><mo stretchy="false">⇁</mo><mo stretchy="false">↼</mo><mo stretchy="false">↽</mo><mo stretchy="false">⇃</mo><mo stretchy="false">⇂</mo><mo stretchy="false">⇋</mo><mo stretchy="false">⇌</mo><mo stretchy="false">↾</mo><mo stretchy="false">↿</mo></mrow><annotation encoding="TeX">\\rightharpoonup \\rightharpoondown \\leftharpoonup \\leftharpoondown \\downharpoonleft \\downharpoonright \\leftrightharpoons \\rightleftharpoons \\upharpoonleft \\upharpoonright</annotation></semantics></math>'],

  /* char commands */
  ["\\dots \\ldots \\cdots \\ddots \\udots \\vdots \\colon \\cup \\union \\bigcup \\Union \\cap \\intersection \\bigcap \\Intersection \\in", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>…</mo><mo>…</mo><mo>⋯</mo><mo>⋱</mo><mo>⋰</mo><mo>⋮</mo><mo>:</mo><mo>∪</mo><mo>∪</mo><mo>⋃</mo><mo>⋃</mo><mo>∩</mo><mo>∩</mo><mo>⋂</mo><mo>⋂</mo><mo>∊</mo></mrow><annotation encoding="TeX">\\dots \\ldots \\cdots \\ddots \\udots \\vdots \\colon \\cup \\union \\bigcup \\Union \\cap \\intersection \\bigcap \\Intersection \\in</annotation></semantics></math>'],
  /* char commands */
  ["\\coloneqq \\Coloneqq \\coloneq \\Coloneq \\eqqcolon \\Eqqcolon \\eqcolon \\Eqcolon \\colonapprox \\Colonapprox \\colonsim \\Colonsim \\dblcolon", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≔</mo><mo>⩴</mo><mo>≔</mo><mo>∷−</mo><mo>≕</mo><mo>=∷</mo><mo>≕</mo><mo>−∷</mo><mo>∶≈</mo><mo>∷≈</mo><mo>∶∼</mo><mo>∷∼</mo><mo>∷</mo></mrow><annotation encoding="TeX">\\coloneqq \\Coloneqq \\coloneq \\Coloneq \\eqqcolon \\Eqqcolon \\eqcolon \\Eqcolon \\colonapprox \\Colonapprox \\colonsim \\Colonsim \\dblcolon</annotation></semantics></math>'],
  /* char commands */
  ["\\ast \\Cap \\Cup \\circledast \\circledcirc \\curlyvee \\curlywedge \\divideontimes \\dotplus \\leftthreetimes \\rightthreetimes \\veebar \\gt \\lt \\approxeq \\backsim \\backsimeq \\barwedge \\doublebarwedge \\subset \\subseteq \\subseteqq \\subsetneq \\subsetneqq \\varsubsetneq \\varsubsetneqq \\prec \\parallel \\nparallel \\shortparallel \\nshortparallel \\perp \\eqslantgtr \\eqslantless \\gg \\ggg \\geq \\geqq \\geqslant \\gneq \\gneqq \\gnapprox \\gnsim \\gtrapprox \\ge \\le \\leq \\leqq \\leqslant \\lessapprox \\lessdot \\lesseqgtr \\lesseqqgtr \\lessgtr \\lneq \\lneqq \\lnsim \\lvertneqq \\gtrsim \\gtrdot \\gtreqless \\gtreqqless \\gtrless \\gvertneqq \\lesssim \\lnapprox \\nsubset \\nsubseteq \\nsubseteqq \\notin \\ni \\notni", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>∗</mo><mo>⋒</mo><mo>⋓</mo><mo>⊛</mo><mo>⊚</mo><mo>⋎</mo><mo>⋏</mo><mo>⋇</mo><mo>∔</mo><mo>⋋</mo><mo>⋌</mo><mo>⊻</mo><mo>&gt;</mo><mo>&lt;</mo><mo>≊</mo><mo>∽</mo><mo>⋍</mo><mo>⌅</mo><mo>⩞</mo><mo>⊂</mo><mo>⊆</mo><mo>⫅</mo><mo>⊊</mo><mo>⫋</mo><mo>⊊︀</mo><mo>⫋︀</mo><mo>≺</mo><mo>∥</mo><mo>∦</mo><mo>∥</mo><mo>∦</mo><mo>⊥</mo><mo>⪖</mo><mo>⪕</mo><mo>≫</mo><mo>⋙</mo><mo>≥</mo><mo>≧</mo><mo>⩾</mo><mo>⪈</mo><mo>≩</mo><mo>⪊</mo><mo>⋧</mo><mo>⪆</mo><mo>≥</mo><mo>≤</mo><mo>≤</mo><mo>≦</mo><mo>⩽</mo><mo>⪅</mo><mo>⋖</mo><mo>⋚</mo><mo>⪋</mo><mo>≶</mo><mo>⪇</mo><mo>≨</mo><mo>⋦</mo><mo>≨︀</mo><mo>≳</mo><mo>⋗</mo><mo>⋛</mo><mo>⪌</mo><mo>≷</mo><mo>≩︀</mo><mo>≲</mo><mo>⪉</mo><mo>⊄</mo><mo>⊈</mo><mo>⊈</mo><mo>∉</mo><mo>∋</mo><mo>∌</mo></mrow><annotation encoding="TeX">\\ast \\Cap \\Cup \\circledast \\circledcirc \\curlyvee \\curlywedge \\divideontimes \\dotplus \\leftthreetimes \\rightthreetimes \\veebar \\gt \\lt \\approxeq \\backsim \\backsimeq \\barwedge \\doublebarwedge \\subset \\subseteq \\subseteqq \\subsetneq \\subsetneqq \\varsubsetneq \\varsubsetneqq \\prec \\parallel \\nparallel \\shortparallel \\nshortparallel \\perp \\eqslantgtr \\eqslantless \\gg \\ggg \\geq \\geqq \\geqslant \\gneq \\gneqq \\gnapprox \\gnsim \\gtrapprox \\ge \\le \\leq \\leqq \\leqslant \\lessapprox \\lessdot \\lesseqgtr \\lesseqqgtr \\lessgtr \\lneq \\lneqq \\lnsim \\lvertneqq \\gtrsim \\gtrdot \\gtreqless \\gtreqqless \\gtrless \\gvertneqq \\lesssim \\lnapprox \\nsubset \\nsubseteq \\nsubseteqq \\notin \\ni \\notni</annotation></semantics></math>'],

  /* char commands */
  ["\\nmid \\nshortmid \\preceq \\npreceq \\ll \\ngeq \\ngeqq \\ngeqslant \\nleq \\nleqq \\nleqslant \\nless \\supset \\supseteq \\supseteqq \\supsetneq \\supsetneqq \\varsupsetneq \\varsupsetneqq \\approx \\asymp \\bowtie \\dashv \\Vdash \\vDash \\VDash \\vdash \\Vvdash \\models \\sim \\simeq \\nsim \\smile \\triangle \\triangledown \\triangleleft \\cong \\succ \\nsucc \\ngtr \\nsupset \\nsupseteq \\propto \\equiv \\nequiv \\frown \\triangleright \\ncong \\succeq \\succapprox \\succnapprox \\succcurlyeq \\succsim \\succnsim \\nsucceq \\nvDash \\nvdash \\nVDash \\amalg \\pm \\mp \\bigcirc \\wr \\odot \\uplus \\clubsuit \\spadesuit \\Diamond \\diamond \\sqcup \\sqcap \\sqsubset \\sqsubseteq \\sqsupset \\sqsupseteq \\Subset \\Supset", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>∤</mo><mo>∤</mo><mo>⪯</mo><mo>⪯̸</mo><mo>≪</mo><mo>≱</mo><mo>⩾̸</mo><mo>⩾̸</mo><mo>≰</mo><mo>⩽̸</mo><mo>⩽̸</mo><mo>≮</mo><mo>⊃</mo><mo>⊇</mo><mo>⫆</mo><mo>⊋</mo><mo>⫌</mo><mo>⊋︀</mo><mo>⫌︀</mo><mo>≈</mo><mo>≍</mo><mo>⋈</mo><mo>⊣</mo><mo>⊩</mo><mo>⊨</mo><mo>⊫</mo><mo>⊢</mo><mo>⊪</mo><mo>⊧</mo><mo>∼</mo><mo>≃</mo><mo>≁</mo><mo>⌣</mo><mo>▵</mo><mo>▿</mo><mo>◃</mo><mo>≅</mo><mo>≻</mo><mo>⊁</mo><mo>≯</mo><mo>⊅</mo><mo>⊉</mo><mo>∝</mo><mo>≡</mo><mo>≢</mo><mo>⌢</mo><mo>▹</mo><mo>≇</mo><mo>⪰</mo><mo>⪸</mo><mo>⪺</mo><mo>≽</mo><mo>≿</mo><mo>⋩</mo><mo>⪰̸</mo><mo>⊭</mo><mo>⊬</mo><mo>⊯</mo><mo>⨿</mo><mo>±</mo><mo>∓</mo><mo>○</mo><mo>≀</mo><mo>⊙</mo><mo>⊎</mo><mo>♣</mo><mo>♠</mo><mo>⋄</mo><mo>⋄</mo><mo>⊔</mo><mo>⊓</mo><mo>⊏</mo><mo>⊑</mo><mo>⊐</mo><mo>⊒</mo><mo>⋐</mo><mo>⋑</mo></mrow><annotation encoding="TeX">\\nmid \\nshortmid \\preceq \\npreceq \\ll \\ngeq \\ngeqq \\ngeqslant \\nleq \\nleqq \\nleqslant \\nless \\supset \\supseteq \\supseteqq \\supsetneq \\supsetneqq \\varsupsetneq \\varsupsetneqq \\approx \\asymp \\bowtie \\dashv \\Vdash \\vDash \\VDash \\vdash \\Vvdash \\models \\sim \\simeq \\nsim \\smile \\triangle \\triangledown \\triangleleft \\cong \\succ \\nsucc \\ngtr \\nsupset \\nsupseteq \\propto \\equiv \\nequiv \\frown \\triangleright \\ncong \\succeq \\succapprox \\succnapprox \\succcurlyeq \\succsim \\succnsim \\nsucceq \\nvDash \\nvdash \\nVDash \\amalg \\pm \\mp \\bigcirc \\wr \\odot \\uplus \\clubsuit \\spadesuit \\Diamond \\diamond \\sqcup \\sqcap \\sqsubset \\sqsubseteq \\sqsupset \\sqsupseteq \\Subset \\Supset</annotation></semantics></math>'],

  /* char commands */
  ["\\ltimes \\div \\rtimes \\bot \\therefore \\thickapprox \\thicksim \\varpropto \\varnothing \\flat \\vee \\because \\between \\Bumpeq \\bumpeq \\circeq \\curlyeqprec \\curlyeqsucc \\doteq \\doteqdot \\eqcirc \\fallingdotseq \\multimap \\pitchfork \\precapprox \\precnapprox \\preccurlyeq \\precsim \\precnsim \\risingdotseq \\sharp \\bullet \\nexists \\dagger \\ddagger \\not \\top \\natural \\angle \\measuredangle \\bigstar \\blacklozenge \\lozenge \\blacksquare \\blacktriangle \\blacktriangleleft \\blacktriangleright \\blacktriangledown \\ntriangleleft \\ntriangleright \\ntrianglelefteq \\ntrianglerighteq \\trianglelefteq \\trianglerighteq \\triangleq \\vartriangleleft \\vartriangleright \\forall \\bigtriangleup \\bigtriangledown \\nprec", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⋉</mo><mo>÷</mo><mo>⋊</mo><mo>⊥</mo><mo>∴</mo><mo>≈</mo><mo>∼</mo><mo>∝</mo><mi>∅</mi><mo>♭</mo><mo>∨</mo><mo>∵</mo><mo>≬</mo><mo>≎</mo><mo>≏</mo><mo>≗</mo><mo>⋞</mo><mo>⋟</mo><mo>≐</mo><mo>≑</mo><mo>≖</mo><mo>≒</mo><mo>⊸</mo><mo>⋔</mo><mo>⪷</mo><mo>⪹</mo><mo>≼</mo><mo>≾</mo><mo>⋨</mo><mo>≓</mo><mo>♯</mo><mo>•</mo><mo>∄</mo><mo>†</mo><mo>‡</mo><mo>¬</mo><mo>⊤</mo><mo>♮</mo><mo>∠</mo><mo>∡</mo><mo>★</mo><mo>⧫</mo><mo>◊</mo><mo>■</mo><mo>▴</mo><mo>◂</mo><mo>▸</mo><mo>▾</mo><mo>⋪</mo><mo>⋫</mo><mo>⋬</mo><mo>⋭</mo><mo>⊴</mo><mo>⊵</mo><mo>≜</mo><mo>⊲</mo><mo>⊳</mo><mo>∀</mo><mo>△</mo><mo>▽</mo><mo>⊀</mo></mrow><annotation encoding="TeX">\\ltimes \\div \\rtimes \\bot \\therefore \\thickapprox \\thicksim \\varpropto \\varnothing \\flat \\vee \\because \\between \\Bumpeq \\bumpeq \\circeq \\curlyeqprec \\curlyeqsucc \\doteq \\doteqdot \\eqcirc \\fallingdotseq \\multimap \\pitchfork \\precapprox \\precnapprox \\preccurlyeq \\precsim \\precnsim \\risingdotseq \\sharp \\bullet \\nexists \\dagger \\ddagger \\not \\top \\natural \\angle \\measuredangle \\bigstar \\blacklozenge \\lozenge \\blacksquare \\blacktriangle \\blacktriangleleft \\blacktriangleright \\blacktriangledown \\ntriangleleft \\ntriangleright \\ntrianglelefteq \\ntrianglerighteq \\trianglelefteq \\trianglerighteq \\triangleq \\vartriangleleft \\vartriangleright \\forall \\bigtriangleup \\bigtriangledown \\nprec</annotation></semantics></math>'],

  /* char commands */
  ["\\aleph \\beth \\eth \\ell \\hbar \\Im \\imath \\jmath \\wp \\Re", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ℵ</mi><mi>ℶ</mi><mi>ð</mi><mi>ℓ</mi><mi>ℏ</mi><mi>ℑ</mi><mi>ı</mi><mi>ȷ</mi><mi>℘</mi><mi>ℜ</mi></mrow><annotation encoding="TeX">\\aleph \\beth \\eth \\ell \\hbar \\Im \\imath \\jmath \\wp \\Re</annotation></semantics></math>'],

  /* char commands */
    ["\\Perp \\Vbar \\boxdot \\Box \\square \\emptyset \\empty \\exists \\circ \\rhd \\lhd \\lll \\unrhd \\unlhd \\Del \\nabla \\sphericalangle \\heartsuit \\diamondsuit \\partial \\qed", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⫫</mo><mo>⫫</mo><mo>⊡</mo><mo>□</mo><mo>□</mo><mi>∅</mi><mi>∅</mi><mo>∃</mo><mo>∘</mo><mo>⊳</mo><mo>⊲</mo><mo>⋘</mo><mo>⊵</mo><mo>⊴</mo><mo>∇</mo><mo>∇</mo><mo>∢</mo><mo>♡</mo><mo>♢</mo><mo>∂</mo><mo>▪</mo></mrow><annotation encoding="TeX">\\Perp \\Vbar \\boxdot \\Box \\square \\emptyset \\empty \\exists \\circ \\rhd \\lhd \\lll \\unrhd \\unlhd \\Del \\nabla \\sphericalangle \\heartsuit \\diamondsuit \\partial \\qed</annotation></semantics></math>'],
  /* char commands */
    ["\\bottom \\neg \\neq \\ne \\shortmid \\mid \\int \\integral \\iint \\doubleintegral \\iiint \\tripleintegral \\iiiint \\quadrupleintegral \\oint \\conint \\contourintegral \\times \\star \\circleddash \\odash \\intercal \\smallfrown \\smallsmile \\boxminus \\minusb \\boxplus \\plusb \\boxtimes \\timesb \\sum \\prod \\product \\coprod \\coproduct \\otimes \\Otimes \\bigotimes \\ominus \\oslash \\oplus \\Oplus \\bigoplus \\bigodot \\bigsqcup \\bigsqcap \\biginterleave \\biguplus \\wedge \\Wedge \\bigwedge \\Vee \\bigvee \\invamp \\parr", '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⊥</mo><mo>¬</mo><mo>≠</mo><mo>≠</mo><mo>∣</mo><mo>∣</mo><mo>∫</mo><mo>∫</mo><mo>∬</mo><mo>∬</mo><mo>∭</mo><mo>∭</mo><mo>⨌</mo><mo>⨌</mo><mo>∮</mo><mo>∮</mo><mo>∮</mo><mo>×</mo><mo>⋆</mo><mo>⊝</mo><mo>⊝</mo><mo>⊺</mo><mo>⌢</mo><mo>⌣</mo><mo>⊟</mo><mo>⊟</mo><mo>⊞</mo><mo>⊞</mo><mo>⊠</mo><mo>⊠</mo><mo>∑</mo><mo>∏</mo><mo>∏</mo><mo>∐</mo><mo>∐</mo><mo>⊗</mo><mo>⨴</mo><mo>⨂</mo><mo>⊖</mo><mo>⊘</mo><mo>⊕</mo><mo>⨭</mo><mo>⨁</mo><mo>⨀</mo><mo>⨆</mo><mo>⨅</mo><mo>⫼</mo><mo>⨄</mo><mo>∧</mo><mo>⋀</mo><mo>⋀</mo><mo>⋁</mo><mo>⋁</mo><mo>⅋</mo><mo>⅋</mo></mrow><annotation encoding="TeX">\\bottom \\neg \\neq \\ne \\shortmid \\mid \\int \\integral \\iint \\doubleintegral \\iiint \\tripleintegral \\iiiint \\quadrupleintegral \\oint \\conint \\contourintegral \\times \\star \\circleddash \\odash \\intercal \\smallfrown \\smallsmile \\boxminus \\minusb \\boxplus \\plusb \\boxtimes \\timesb \\sum \\prod \\product \\coprod \\coproduct \\otimes \\Otimes \\bigotimes \\ominus \\oslash \\oplus \\Oplus \\bigoplus \\bigodot \\bigsqcup \\bigsqcap \\biginterleave \\biguplus \\wedge \\Wedge \\bigwedge \\Vee \\bigvee \\invamp \\parr</annotation></semantics></math>']
]

function escape(aString)
{
    return aString ? aString.replace(/([\\\'])/g, "\\$1") : aString;
}

var failures = 0, unexpectedfailures = 0, i = 0, output, input;

function printTestResult(aSuccess, aExpectedFailure)
{
    i++;
    if (aSuccess) {
      console.log("Test " + i + "... PASS");
    } else {
      failures++;
      if (!aExpectedFailure) {
        unexpectedfailures++;
      }
      console.log("Test " + i + "... " +
                  (aExpectedFailure ? "EXPECTED FAIL" : "FAIL"));
    }
}

while (i < tests.length) {
    try {
        /* Test TeXZilla.toMathMLString against a reference output. */
        output = TeXZilla.toMathMLString(tests[i][0]);
        if (output !== tests[i][1]) {
            throw ("TeXZilla.toMathMLString, unexpected result:\n" +
                   "  Actual: '" + escape(output) + "'\n" +
                   "  Expected: '" + escape(tests[i][1]) + "'");
        }
        if (hasDOMAPI) {
          /* Do the same conversion with TeXZilla.toMathML and try to extract
             the original input again with TeXZilla.getTeXSource */
          input = TeXZilla.getTeXSource(TeXZilla.toMathML(tests[i][0]));
          if (input !== tests[i][0]) {
              throw ("TeXZilla.getTeXSource, unexpected result:\n" +
                     "  Actual: '" + escape(input) + "'\n" +
                     "  Expected: '" + escape(tests[i][0]) + "'");
          }
        }
        printTestResult(true);
    } catch(e) {
        printTestResult(false, tests[i][2]);
        console.log(e);
    }
}

/* Test error handling */
var badsource= "\\frac";
var error = "Parse error on line 1";
var success;

/* 1) with <merror> */
success = false;
try {
    output = TeXZilla.toMathMLString(badsource, false, false);
} catch(e) {
    console.log(e)
}
success = (output.indexOf(error) != -1 && output.indexOf("<merror>") != -1);
printTestResult(success);

/* 2) with exception */
success = false;
try {
    TeXZilla.toMathMLString(badsource, false, false, true);
} catch(e) {
    try {
        if (e.message.indexOf(error) != -1) {
            success = true;
        }
    } catch(e) {
        console.log(e);
    }
}
printTestResult(success);

/* Test itex identifier mode */
TeXZilla.setItexIdentifierMode(true);
output = TeXZilla.toMathMLString("xy");
success = (output === '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>xy</mi><annotation encoding="TeX">xy</annotation></semantics></math>');
printTestResult(success);
if (!success) {
  console.log("itex identifier mode ignored: " + escape(output));
}
TeXZilla.setItexIdentifierMode(false);

/* Test safe mode */
TeXZilla.setSafeMode(true);
output =
  TeXZilla.toMathMLString("\\href{javascript:alert(\"!\")}{\\mtext{evil}}");
success = (output === '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>evil</mtext></mrow><annotation encoding="TeX">\\href{javascript:alert("!")}{\\mtext{evil}}</annotation></semantics></math>');
printTestResult(success);
if (!success) {
  console.log("safe mode ignored: " + escape(output));
}
TeXZilla.setSafeMode(false);

if (hasDOMAPI) {
  /* Testing toImage */
  /* 1) basic format */
  var head = "data:image/svg+xml;base64,";
  var img;
  try {
    img = TeXZilla.toImage("x", true, false, 77);
    success = (img.toString().indexOf("[object HTMLImageElement]") !== -1 &&
               img.src.indexOf(head) === 0)
  } catch(e) {
    console.log(e);
    success = false;
  }
  printTestResult(success);

  /* 2) Test the SVG source */
  try {
    /* phantomjs/slimerjs serializes differently, so we can't have a complete
       reference string */
    output = window.atob(img.src.substr(head.length));
    success =
          output.indexOf('<svg ') >= 0 &&
          output.indexOf('dir="rtl"') >= 0 &&
          output.indexOf('translate(0,0)') >= 0 &&
          output.indexOf('mathsize="77px"') >= 0 &&
          output.indexOf('<foreignObject ') >= 0 &&
          output.indexOf('width="' + img.width + 'px"') >= 0 &&
          output.indexOf('height="' + img.height + 'px"') >= 0 &&
          output.indexOf('<semantics><mi>x</mi><annotation encoding="TeX">x</annotation></semantics>') >= 0 &&
          output.indexOf('</g></svg>') >= 0;
  } catch(e) {
    console.log(e);
    success = false;
  }
  printTestResult(success);
  if (!success) {
    console.log("Bad toImage output: " + output);
  }

  /* 3) Test the power of two param */
  function isPowerOfTwo(x) {
    while (x % 2 === 0) {
      x /= 2;
    }
    return (x === 1);
  }
  try {
    img = TeXZilla.toImage("\\frac{x}{y}", false, true);
    success = isPowerOfTwo(img.width) && isPowerOfTwo(img.height);
  } catch(e) {
    console.log(e);
    success = false;
  }
  printTestResult(success);
  if (!success) {
    console.log("Bad toImage dimension: " + img.width + ", " + img.height);
  }
}

/* Testing filterString */

/* 1) basic delimiters */
output = TeXZilla.filterString("blah $a$ blah $$b$$ blah \\[c\\] blah \\(d\\) blah");
success = (output === 'blah <math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>a</mi><annotation encoding="TeX">a</annotation></semantics></math> blah <math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mi>b</mi><annotation encoding="TeX">b</annotation></semantics></math> blah <math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mi>c</mi><annotation encoding="TeX">c</annotation></semantics></math> blah <math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>d</mi><annotation encoding="TeX">d</annotation></semantics></math> blah');
printTestResult(success);
if (!success) {
  console.log("Bad filterString output: " + output)
}

/* 2) empty math, new line and escaped characters */
output = TeXZilla.filterString("blah \\[\\] \\(\\) \n \\$ \\\\ blah");
success = (output === 'blah <math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow/><annotation encoding="TeX"/></semantics></math> <math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow/><annotation encoding="TeX"/></semantics></math> \n $ \\ blah')
printTestResult(success);
if (!success) {
  console.log("Bad filterString output: " + output)
}

if (hasDOMAPI) {
  /* Testing filterElement */
  // We verify that <head>/attributes/comments are not processed but that
  // fragments in <body> are.
  // We check basic escaping and delimiters.
  // We check that special XML characters &amp; &lt; &gt; do not cause problems.
  var doc = (new DOMParser).parseFromString('<html xmlns="http://www.w3.org/1999/xhtml"><head>\\$</head><body><p class="\$"><!-- \$ --> &amp; &lt; &gt; \\$ <span>blah $x$ <span>$$y$$ \\\\</span> blah</span> $z$ </p></body></html>', "application/xml");
  TeXZilla.filterElement(doc.documentElement.lastElementChild);
  output = (new XMLSerializer).serializeToString(doc);
  success = output.indexOf('<p class="\$"><!-- \$ --> &amp; &lt; &gt; $ <span>blah <math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="TeX">x</annotation></semantics></math> <span><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mi>y</mi><annotation encoding="TeX">y</annotation></semantics></math> \\</span> blah</span> <math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>z</mi><annotation encoding="TeX">z</annotation></semantics></math> </p>') >= 0 && output.indexOf('<head>\\$</head>') >= 0;
  printTestResult(success);
  if (!success) {
    console.log("Bad filterElement output: " + output)
  }

  /* Testing setDOMParser */
  TeXZilla.setDOMParser({
    parseFromString: function (aString, aType) {
      return (new DOMParser).parseFromString('<html xmlns="http://www.w3.org/1999/xhtml"><body>' + aString + '</body></html>', aType);
    }
  })
  output = (new XMLSerializer).serializeToString(TeXZilla.toMathML("x"));
  success = (output === '<html xmlns="http://www.w3.org/1999/xhtml"><body><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mi>x</mi><annotation encoding="TeX">x</annotation></semantics></math></body></html>');
  printTestResult(success);
  if (!success) {
    console.log("setDOMParser failure: " + output)
  }
  TeXZilla.setDOMParser(new DOMParser);

  /* Testing setXMLSerializer */
  TeXZilla.setXMLSerializer({
    serializeToString: function () {
      return "<svg/>";
    }
  })
  output = window.atob(TeXZilla.toImage("x").src.substr(head.length));
  success = (output === "<svg/>");
  if (!success) {
    console.log("setXMLSerializer failure: " + output)
  }
  TeXZilla.setDOMParser(new XMLSerializer);
}

/* Print test results */
if (failures > 0) {
    console.log(failures + " test(s) failed (" +
                unexpectedfailures + " unexpected).");
} else {
    console.log("All tests passed.");
}

// FIXME: we should use a standard commonJS for exit.
// https://github.com/fred-wang/TeXZilla/issues/6
var code = (unexpectedfailures == 0 ? 0 : 1);
if (typeof process != "undefined") {
    process.exit(code);
} else if (typeof slimer != "undefined") {
    slimer.exit(code);
} else if (typeof phantom != "undefined") {
    phantom.exit(code);
}
