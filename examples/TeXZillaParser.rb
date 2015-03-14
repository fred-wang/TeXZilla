# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Install the Ruby interface to the V8 JavaScript engine
#
#   gem install therubyracer
#
# and execute this program with
#
#   ruby TeXZillaParser.rb aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]
#

require "v8"

TEXZILLA_JS = "../TeXZilla-min.js"

# Verify that we have at least one argument.
if ARGV.length == 0
    puts "usage: ruby TeXZillaParser.rb aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]"
    exit 1
end

# Prepare the V8 Javascript engine and load TeXZilla.js
context = V8::Context.new
context.eval("var window = {};")
context.load(TEXZILLA_JS)

# Bind the arguments to Javascript variables.
context["tex"] = ARGV[0]
context["display"] = ARGV.length >= 2 && ARGV[1] == "true"
context["rtl"] = ARGV.length >= 3 && ARGV[2] == "true"
context["throwException"] = ARGV.length >= 4 && ARGV[3] == "true"

# Execute TeXZilla.toMathMLString with the specified arguments.
begin
  puts context.eval("window.TeXZilla.toMathMLString(tex, display, rtl, throwException)")
rescue => e
  puts e.message
end 
