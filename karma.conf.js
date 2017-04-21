'use strict';
const {getKarmaConfig} = require("./testing/karma.conf.common");

module.exports = function (karma) {
  karma.set(getKarmaConfig({testBundle: './packages/tests.ts', karma}))
};
