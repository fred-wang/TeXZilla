#!gmake
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

include config.cfg

help:
	@echo ""
	@echo "make help"
	@echo "  Display this help message."
	@echo ""
	@echo "make build"
	@echo "  Build the TeXZilla.js parser."
	@echo
	@echo "make minify"
	@echo "  Build the TeXZilla-min.js parser."
	@echo "  (This requires Java and Google Closure Compiler)"
	@echo ""
	@echo "make tests"
	@echo "  Run the unit tests."
	@echo ""

unicode.xml:
# Download the unicode.xml file from the "XML Entity Definitions for Characters"
	$(WGET) http://www.w3.org/2003/entities/2007xml/unicode.xml
# Workaround for https://github.com/fred-wang/TeXZilla/issues/5
	patch < unicode.patch

chars.txt: extractChars.xsl unicode.xml
# Extract the relevant information on characters from unicode.xml
	$(XSLTPROC) $^ > $@

char-commands.txt: generateCharCommands.py chars.txt
# Reformat the information on characters as Jison Lexical rules.
	$(PYTHON) $^ $@;

commands.txt: char-commands.txt base-commands.txt
# Merge the two set of commands and sort them in reverse order according to the
# quoted key, so that e.g. Jison will treat "\\mathbb{C}" before "\\mathbb".
	cat $^ | egrep -v "^#" | \
	sort --reverse --field-separator='"' --key=2,2 > $@

TeXZilla.jisonlex: main.jisonlex commands.txt
# Generate the Jison lexical grammar.
	cat $^ > $@
	echo "[\uD800-\uDBFF] return \"HIGH_SURROGATE\";" >> $@
	echo "[\uDC00-\uDFFF] return \"LOW_SURROGATE\";" >> $@
	echo ". return \"BMP_CHARACTER\";" >> $@

TeXZilla-web.js: TeXZilla.jison TeXZilla.jisonlex
# Generate the Javascript parser from the Jison grammars.
	@echo "Generating the parser, this may take some time..."
	$(JISON) --outfile $@ --module-type js TeXZilla.jison TeXZilla.jisonlex
	$(SED) -i "s|\\\\b)/|)/|g" $@ # jison issue 204
	$(SED) -i "s|var TeXZillaWeb =|var TeXZilla =|" $@
	cat MPL-header.js $@ > tmp.js
	mv tmp.js $@

TeXZilla.js: TeXZilla-web.js commonJS.js
# Append the commonJS.js interface to TeXZilla-web.js (without the header).
	cp TeXZilla-web.js TeXZilla.js
	$(SED) "1,6d" commonJS.js >> TeXZilla.js

TeXZilla-min.js: TeXZilla-web.js
# Minify the Javascript parser using Google's Closure Compiler.
	$(JAVA) -jar $(CLOSURE_COMPILER) $< > tmp.js
	cat MPL-header.js tmp.js > $@
	rm tmp.js

tests: unit-tests.js TeXZilla.js
	$(SLIMERJS) $<

build: TeXZilla.js

minify: TeXZilla-min.js

all: tests build

clean:
# Remove all generated files except unicode.xml and LaTeX-min.js
	rm -f chars.txt char-commands.txt commands.txt \
	TeXZilla.jisonlex TeXZilla.js TeXZilla-web.js

distclean: clean
# Remove all generated files.
	rm -f unicode.xml TeXZilla-min.js

release:
# Generate a release branch.
	./release.sh
