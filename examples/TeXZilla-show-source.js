/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  window.addEventListener("DOMContentLoaded",  function() {
    var maths = document.body.getElementsByTagNameNS("http://www.w3.org/1998/Math/MathML", "math");
    for (var i = 0; i < maths.length; i++) {
      maths[i].addEventListener("dblclick",  function(event) {
        var tex = TeXZilla.getTeXSource(event.currentTarget);
        var w = window.open("about:blank", "TeX Source", "width=500");
        if (w) {
          w.document.write("<html><head><title>TeX Source</title></head>")
          w.document.write("<body><p>" + tex + "</p></body>");
          w.document.write("</html>");
        } else {
          window.alert(tex);
        }
      });
    }
  });
})();