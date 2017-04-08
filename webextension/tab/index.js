/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function update(aValue)
{
  var input = document.getElementById("input");
  var output = document.getElementById("output");
  while (output.firstChild)
    output.removeChild(output.firstChild);
  if (aValue) input.value = aValue;
  try {
    output.style.color = "inherit";
    var math = TeXZilla.
      toMathML(input.value,
               document.getElementById("mode").value === "display",
               document.getElementById("dir").value === "RTL", true);
    output.appendChild(math);
  } catch(e) {
    output.style.color = "red";
    output.textContent = input.value;
  }
}

document.getElementById("mode").addEventListener("change", function() {
  var math = document.getElementById("output").firstElementChild;
  if (math) {
    math.setAttribute("display",
      document.getElementById("mode").value === "display" ?
      "block" : "inline");
  } else {
    update();
  }
});

document.getElementById("dir").addEventListener("change", function() {
  var math = document.getElementById("output").firstElementChild;
  if (math) {
    math.setAttribute("dir",
      document.getElementById("dir").value === "RTL" ?
      "rtl" : "ltr");
  } else {
    update();
  }
});

document.getElementById("examples").addEventListener("change", function(event) {
  update(event.currentTarget.value);
});

document.getElementById("input").addEventListener("input", function() {
  update();
});
