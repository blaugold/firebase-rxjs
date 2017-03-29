/**
 * Created by gabrielterwesten on 24/03/2017.
 */

export default {
  entry: './dist/packages/firebase-rxjs/firebase-rxjs.js',
  dest: './dist/packages/firebase-rxjs/bundles/firebase-rxjs.umd.js',
  exports: 'named',
  format: 'umd',
  moduleName: 'firebaseRxJS',
  sourceMap: true,
  context: 'this',
  onwarn: () => {},
  globals: {
    'firebase': 'firebase',
    'rxjs/Observable': 'Rx',
    'rxjs/Subscriber': 'Rx',
    'rxjs/observable/fromPromise': 'Rx.Observable',
    'rxjs/observable/of': 'Rx.Observable',
    'rxjs/operator/map': 'Rx.Observable.prototype',
    'rxjs/operator/mapTo': 'Rx.Observable.prototype',
    'rxjs/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/operator/toArray': 'Rx.Observable.prototype',
    'rxjs/operator/share': 'Rx.Observable.prototype',
  },
}
