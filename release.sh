#!/bin/bash
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

GIT=$1
SED=$2
MAKE=$3
EGREP=$4
NPM=$5

echo "This may mess up your git repository. Are you sure you want to continue [Y,n]?"
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

# Build TeXZilla.js and TeXZilla-min.js
$MAKE build
$MAKE minify

# Publish the npm release.
$NPM publish .

# Remove all but the files to include in the release.
rm .gitignore .travis.yml
ls | $EGREP -v "README-release.txt|TeXZilla.js|TeXZilla-min.js|examples|index.html" | xargs rm -rf

# Set the version in the README-release.txt
$SED -i s/RELEASENUMBER/$RELEASENUMBER/ README-release.txt

# Commit the changes.
$GIT add --no-ignore-removal .
$GIT commit -m "TeXZilla Release $RELEASENUMBER"
$GIT tag -a v$RELEASENUMBER -m "TeXZilla Release $RELEASEMESSAGE"

# Come back to the master branch.
$GIT checkout master
