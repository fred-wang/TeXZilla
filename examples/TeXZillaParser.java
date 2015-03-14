/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//
// Compile this class with
//
//   javac TeXZillaParser.java
//
// and execute it with
//
//   java TeXZillaParser aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]
//

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import java.io.FileReader;

public class TeXZillaParser {

    private static final String TEXZILLA_JS = "../TeXZilla-min.js";

    public static void main(String[] aArgs) {
        // Verify parameters.
        if (aArgs.length == 0) {
            System.out.println("usage: java TeXZillaParser aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]");
            System.exit(1);
        }
        String tex = aArgs[0];
        boolean display = aArgs.length >= 2 && aArgs[1].equals("true");
        boolean rtl = aArgs.length >= 3 && aArgs[2].equals("true");
        boolean throwException = aArgs.length >= 4 && aArgs[3].equals("true");

        // Try and find a Javascript engine.
        ScriptEngineManager scriptEngineManager =
            new ScriptEngineManager();
        ScriptEngine jsEngine = scriptEngineManager.getEngineByName("nashorn");
        if (jsEngine == null) {
            jsEngine = scriptEngineManager.getEngineByName("rhino");
            if (jsEngine == null) {
                System.out.println("Nashorn or Rhino not found!");
                System.exit(1);
            }
        }

        // Load TeXZilla.js and execute TeXZilla.toMathMLString with the
        // specified arguments.
        try {
            jsEngine.eval("var window = {};");
            jsEngine.eval(new FileReader(TEXZILLA_JS));
            Object TeXZilla = jsEngine.eval("window.TeXZilla");
            Invocable invocable = (Invocable) jsEngine;
            System.out.println(invocable.
                               invokeMethod(TeXZilla, "toMathMLString",
                                            tex, display, rtl, throwException));
        } catch(Exception e) {
            System.out.println(e.getMessage());
            System.exit(1);
        }
    }
}
