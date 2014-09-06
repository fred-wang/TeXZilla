/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*global TeXZilla, Element, document*/

(function () {
    "use strict";

    function updateMathMLOutput(aElement) {
        var tex = aElement.textContent,
            display = aElement.getAttribute("display"),
            dir = aElement.getAttribute("dir");
        try {
            // Parse the TeX input and replace it with the MathML output.
            aElement.shadowRoot.innerHTML =
                TeXZilla.toMathMLString(tex, display === "block",
                                        dir === "rtl", true);
        } catch (e) {
            // Parsing failed: use an <merror> with the original TeX input.
            aElement.shadowRoot.innerHTML =
                "<math><merror><mtext>" + tex + "</mtext></merror></math>";
        }
    }

    var XTeXProto = Object.create(Element.prototype, {
        source: {
            // Implement a "source" property to get/set the TeX source.
            get: function () {
                return this.textContent;
            },
            set: function (aTeX) {
                this.textContent = aTeX;
                updateMathMLOutput(this);
            }
        }
    });

    XTeXProto.createdCallback = function () {
        this.createShadowRoot();
        updateMathMLOutput(this);
    };

    XTeXProto.attributeChangedCallback = function (aName, aOld, aNew) {
        if (aName === "dir" || aName === "display") {
            if (aNew === null) {
                this.shadowRoot.firstElementChild.removeAttribute(aName);
            } else {
                this.shadowRoot.firstElementChild.setAttribute(aName, aNew);
            }
        }
    };

    document.registerElement("x-tex", {
        prototype: XTeXProto
    });
}());
