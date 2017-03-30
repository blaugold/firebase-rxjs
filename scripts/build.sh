#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "${DIR}/.." && pwd )"
BIN=${ROOT}/node_modules/.bin
PKGS=${ROOT}/packages
PKGS_DIST=${ROOT}/dist/packages

buildJS () {
    echo "Building js for $1"
    ${BIN}/ngc -p ${PKGS}/$1/tsconfig.dist.json
    ${BIN}/cpy README.md CHANGELOG.md ${PKGS}/$1/package.json dist/packages/$1
}

bundle() {
    echo "Bundling $1"
    ${BIN}/rollup -c ${PKGS}/$1/rollup.config.js
}

uglify () {
    echo "Uglifying $1"
    ${BIN}/uglifyjs -c \
        -o ${PKGS_DIST}/$1/bundles/$1.umd.min.js \
        --source-map ${PKGS_DIST}/$1/bundles/$1.umd.min.map.js \
        ${PKGS_DIST}/$1/bundles/$1.umd.js
}

cleanDist () {
    echo "Cleaning dist folder"
    ${BIN}/rimraf ${PKGS_DIST}
}

cleanSrc () {
    echo "Cleaning src folders"
    ${BIN}/rimraf -rf "${PKGS}/*/node_modules"
    ${BIN}/rimraf -rf "${PKGS}/*/dist"
    ${BIN}/rimraf -rf "${PKGS}/**/*.{ngsummary.json,ngfactory.ts}"
}

buildPkg () {
    buildJS $1
    bundle $1
    uglify $1
}

build () {
    cleanDist
    buildPkg firebase-rxjs
    buildPkg firebase-rxjs-angular
    ${DIR}/version.js
    cleanSrc
}

docsPkg () {
    echo "Building docs for $1"
    local DOCS_DIR=${ROOT}/docs/$1
    rm -rf DOCS_DIR
    ${BIN}/typedoc --options typedoc.json -out ${DOCS_DIR} ${PKGS}/$1/$1.ts
}

docs () {
    docsPkg firebase-rxjs
    docsPkg firebase-rxjs-angular
}

"$@"
