# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Install the Perl interface to the V8 JavaScript engine
#
#   cpan JavaScript::V8
#
# and execute this program with
#
#   perl TeXZillaParser.pl aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]
#

use strict;
use warnings;
use File::Slurp;
use JavaScript::V8;

my $TEXZILLA_JS = "../TeXZilla-min.js";

# Verify that we have at least one argument.
my $argc = $#ARGV + 1;
if ($argc == 0) {
    print "usage: perl TeXZillaParser.pl aTeX [aDisplay] [aRTL] [aThrowExceptionOnError]\n";
    exit 1;
}

# Prepare the V8 Javascript engine and load TeXZilla.js
my $context = JavaScript::V8::Context->new();
$context->name_global("window");
$context->eval(scalar read_file $TEXZILLA_JS);

# Bind the arguments to Javascript variables.
$context->bind(tex => $ARGV[0]);
$context->bind(display => ($argc >= 2 && $ARGV[1] eq "true"));
$context->bind(rtl => ($argc >= 3 && $ARGV[2] eq "true"));
$context->bind(throwException => ($argc >= 4 && $ARGV[3] eq "true"));

# Execute TeXZilla.toMathMLString with the specified arguments.
my $result = $context->
    eval("TeXZilla.toMathMLString(tex, display, rtl, throwException)");
if (defined $result) {
    print $result;
} else {
    print $@;
}
