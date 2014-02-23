#!/bin/bash
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
source ./config.cfg

echo "This may mess up your GIT repository. Are you sure you want to continue [Y,n]?"
read ANSWER
if [ "$ANSWER" != "Y" ]
then
    echo "Aborted."
    exit 1
fi

echo "Please enter the release number (e.g. 1.0):"
read RELEASENUMBER
RELEASEBRANCH=TeXZilla-$RELEASENUMBER

# Create a new release branch.
$GIT checkout master
$GIT branch $RELEASEBRANCH
$GIT checkout $RELEASEBRANCH

# Build TeXZilla.
$MAKE minify

# Remove all but the files to include in the release.
rm .gitignore
ls | egrep -v "README.md|TeXZilla.js|TeXZilla-min.js|examples|index.html" | xargs rm

# Remove the Build Instructions from the README file.
$SED -n "/Build Instructions/q;p" README.md > README.tmp
mv README.tmp README.md

# Commit the changes.
$GIT add --no-ignore-removal .
$GIT commit -m "TeXZilla Release $RELEASENUMBER"
$GIT tag -a v$RELEASENUMBER -m "TeXZilla Release $RELEASEMESSAGE"

# Come back to the master branch.
$GIT checkout master
