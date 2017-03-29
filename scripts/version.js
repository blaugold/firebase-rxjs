#!/usr/local/bin/node

const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

function replaceVersion(packageName) {
  const pkgPath = path.resolve('./dist/packages', packageName, 'package.json');
  const p = JSON.parse(fs.readFileSync(pkgPath).toString());
  p.version = pkg.version;
  fs.writeFileSync(pkgPath, JSON.stringify(p, null, 2));
}

replaceVersion('firebase-rxjs');
replaceVersion('firebase-rxjs-angular');