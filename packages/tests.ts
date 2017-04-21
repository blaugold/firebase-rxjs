import 'core-js'

import 'zone.js/dist/zone'
import 'zone.js/dist/long-stack-trace-zone'
import 'zone.js/dist/proxy'
import 'zone.js/dist/fake-async-test'
import 'zone.js/dist/sync-test'
import 'zone.js/dist/async-test'
import 'zone.js/dist/jasmine-patch'

import { TestBed } from '@angular/core/testing'
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing'

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
)

declare var __karma__: any;
declare var require: any;

__karma__.loaded = function () {}

const context = require.context('./', true, /\/.+\/src\/.+\.spec\.ts$/)

context.keys().map(context)

__karma__.start()
