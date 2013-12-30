#!gmake
#
# Copyright (C) 2013-2014 Frédéric Wang
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

include config.cfg

help:
	@echo ""
	@echo "make help"
	@echo "  Display this help message."
	@echo ""
	@echo "make build"
	@echo "  Build the TeXZilla.js parser."
	@echo
	@echo "make min"
	@echo "  Build the TeXZilla-min.js parser."
	@echo "  (This require Java and Google Closure Compiler)"
	@echo ""
	@echo "make tests"
	@echo "  Run the unit tests."
	@echo ""

unicode.xml:
# Download the unicode.xml file from the "XML Entity Definitions for Characters"
	$(WGET) http://www.w3.org/2003/entities/2007xml/unicode.xml

chars.txt: extractChars.xsl unicode.xml
# Extract the relevant information on characters from unicode.xml
	$(XSLTPROC) $^ > $@

char-commands.txt: generateCharCommands.py chars.txt
# Reformat the information on characters as Jison Lexical rules.
	$(PYTHON) $^ $@;

commands.txt: char-commands.txt base-commands.txt
# Merge the two set of commands and sort them in reverse order according to the
# quoted key, so that e.g. Jison will treat "\\mathbb{C}" before "\\mathbb".
	cat $^ | grep -v "#" | \
	sort --reverse --field-separator='"' --key=2,2 > $@

TeXZilla.jisonlex: main.jisonlex commands.txt
# Generate the Jison lexical grammar.
	cat $^ > $@
	echo ".+ return \"UNKNOWN_TEXT\";" >> $@

TeXZilla.js: TeXZilla.jison TeXZilla.jisonlex commonJS.js
# Generate the Javascript parser from the Jison grammars.
	@echo "Generating the parser, this may take some time..."
	$(JISON) --outfile $@ TeXZilla.jison TeXZilla.jisonlex
	$(SED) -i "s|\\\\b)/|)/|g" $@ # jison issue 204
	cat commonJS.js >> $@

TeXZilla-min.js: TeXZilla.js
# Minify the Javascript parser using Google's Closure Compiler.
	$(JAVA) -jar $(CLOSURE_COMPILER) $< > $@

tests: unit-tests.js TeXZilla-min.js
	$(SLIMERJS) $<

build: TeXZilla.js
	$(SED) -i 's/TeXZilla-min.js/TeXZilla.js/g' index.html

min: TeXZilla-min.js
	$(SED) -i 's/TeXZilla.js/TeXZilla-min.js/g' index.html

all: tests TeXZilla

clean:
# Remove all generated files except unicode.xml and LaTeX-min.js
	rm -f chars.txt char-commands.txt commands.txt \
	TeXZilla.jisonlex TeXZilla.js

distclean: clean
# Remove all generated files.
	rm -f unicode.xml TeXZilla-min.js
