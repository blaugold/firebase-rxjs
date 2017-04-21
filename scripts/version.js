#!/usr/local/bin/node

const fs = require('fs');
const path = require('path');
const rootPkg = require('../package.json');

const placeholder = /<--VERION_PLACEHOLDER-->/g;

function replaceVersion(packageName) {
  const pkgPath = path.resolve('./dist/packages', packageName, 'package.json');
  const pkgStr = fs.readFileSync(pkgPath).toString();
  const pkgStrReplaced = pkgStr.replace(placeholder, rootPkg.version);
  fs.writeFileSync(pkgPath, pkgStrReplaced);
}

replaceVersion('firebase-rxjs');
replaceVersion('firebase-rxjs-angular');