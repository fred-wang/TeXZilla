#!/bin/bash
SCRIPT_PATH=`dirname "$(readlink -f "$0")"`
nodejs $SCRIPT_PATH/TeXZilla.js $@
