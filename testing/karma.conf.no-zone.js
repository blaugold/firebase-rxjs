'use strict';
const {getKarmaConfig} = require("./karma.conf.common");

module.exports = function (karma) {
  karma.set(getKarmaConfig({testBundle: './packages/tests.no-zone.ts', karma}))
};
