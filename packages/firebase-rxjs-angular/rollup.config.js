
export default {
  entry: './dist/packages/firebase-rxjs-angular/firebase-rxjs-angular.js',
  dest: './dist/packages/firebase-rxjs-angular/bundles/firebase-rxjs-angular.umd.js',
  format: 'umd',
  moduleName: 'firebaseRxJS.ng',
  sourceMap: true,
  exports: 'named',
  context: 'this',
  onwarn: () => {},
  globals: {
    "@angular/core": "ng.core",
    "firebase-rxjs": "firebaseRxJS"
  },
}
