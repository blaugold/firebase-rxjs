'use strict';
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const {TsConfigPathsPlugin} = require('awesome-typescript-loader');

let firebaseConfig = process.env.FIREBASE_CONFIG ||
    fs.readFileSync('./firebase.config.local.json', {encoding: 'utf8'});

if (firebaseConfig === '') {
  throw new Error('Failed to load Firebase config.')
}

const coverage = !!process.env['COVERAGE'];
if (coverage) {
  console.log('Running tests with coverage!');
}

const reporters = ['mocha', 'kjhtml'];

if (coverage) {
  reporters.push('karma-remap-istanbul')
}

const rules = [{
  test: /\.ts$/,
  loader: 'awesome-typescript-loader',
  exclude: /node_modules/,
  query: {
    configFileName: './packages/tsconfig.json'
  }
}];

if (coverage) {
  rules.push({
    enforce: 'post',
    test: /\.(ts|js)$/,
    loader: 'sourcemap-istanbul-instrumenter-loader',
    exclude: [
      /\.(spec|e2e|bundle)\.ts$/,
      /node_modules/
    ],
    query: {'force-sourcemap': true}
  })
}

exports.getKarmaConfig = function ({karma, testBundle}) {
  return {
    basePath: path.resolve(__dirname, '..'),

    mime: {
      'application/javascript': ['ts']
    },

    frameworks: ['jasmine'],

    files: [{pattern: testBundle, watched: false}],

    preprocessors: {
      [testBundle]: ['webpack']
    },

    reporters,

    remapIstanbulReporter: {
      reports: {
        html: 'coverage',
        lcovonly: 'coverage/lcov.info'
      }
    },

    browsers: ['Chrome'],
    browserConsoleLogOptions: {
      level: ""
    },
    colors: true,
    autoWatch: true,
    singleRun: false,
    logLevel: karma.LOG_INFO,

    webpack: {
      devtool: 'inline-source-map',

      resolve: {
        extensions: ['.ts', '.js'],
        modules: [
          path.resolve(__dirname, '../node_modules'),
          path.resolve(__dirname, '../packages')
        ]
      },

      module: {
        rules,
      },

      plugins: [
        new TsConfigPathsPlugin({tsconfig: path.resolve(__dirname, '../packages/tsconfig.json')}),
        new webpack.DefinePlugin({
          firebaseConfig
        }),
        new webpack.SourceMapDevToolPlugin({
          filename: null, // if no value is provided the sourcemap is inlined
          test: /\.(ts|js)($|\?)/i // process .js and .ts files only
        })
      ]
    }
  }
};
