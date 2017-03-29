#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${DIR}/../testing/ng-project
npm i
npm run e2e
# Make sure aot and uglification work
npm run ng -- build --prod --env dev