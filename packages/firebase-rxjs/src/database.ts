import { database } from 'firebase'
import { Observable } from 'rxjs/Observable'
import { of } from 'rxjs/observable/of'
import { map } from 'rxjs/operator/map'
import { mapTo } from 'rxjs/operator/mapTo'
import { Subscriber } from 'rxjs/Subscriber'
import { FirebaseApp } from './app'
import { DataSnapshotObservable, makeDataSnapshotObservable } from './data-snapshot-observable'
import {
  DataSnapshot,
  EventType,
  NativeDatabaseRef,
  Priority,
  Query,
  TransactionResult
} from './interfaces'
import { NativeFirebaseDatabase } from './native-firebase'

/**
 * Enum of event types.
 */
export class Event {
  static Value: EventType        = 'value'
  static ChildAdded: EventType   = 'child_added'
  static ChildChanged: EventType = 'child_changed'
  static ChildRemoved: EventType = 'child_removed'
  static ChildMoved: EventType   = 'child_moved'
}

export class FirebaseQuery<T> {
  private query: Query
  protected wrappedRef: FirebaseDatabaseRef<T>

  get ref(): FirebaseDatabaseRef<T> {
    return this.wrappedRef
  }

  constructor(protected _ref: NativeDatabaseRef, protected app: FirebaseApp) {}

  orderByChild(child: keyof T[keyof T]): FirebaseQuery<T> {
    this._call('orderByChild', child)
    return this
  }

  orderByKey(): FirebaseQuery<T> {
    this._call('orderByKey')
    return this
  }

  orderByPriority(): FirebaseQuery<T> {
    this._call('orderByPriority')
    return this
  }

  orderByValue(): FirebaseQuery<T> {
    this._call('orderByValue')
    return this
  }

  startAt(value: number | string | boolean | null, key?: keyof T[keyof T]): FirebaseQuery<T> {
    this._call('startAt', value, key)
    return this
  }

  endAt(value: number | string | boolean | null, key?: keyof T[keyof T]): FirebaseQuery<T> {
    this._call('endAt', value, key)
    return this
  }

  equalTo(value: number | string | boolean | null, key?: keyof T[keyof T]): FirebaseQuery<T> {
    this._call('equalTo', value, key)
    return this
  }

  limitToFirst(limit: number): FirebaseQuery<T> {
    this._call('limitToFirst', limit)
    return this
  }

  limitToLast(limit: number): FirebaseQuery<T> {
    this._call('limitToLast', limit)
    return this
  }

  once(event: 'value'): DataSnapshotObservable<T>
  once(event: 'child_added'): DataSnapshotObservable<T[keyof T]>
  once(event: 'child_changed'): DataSnapshotObservable<T[keyof T]>
  once(event: 'child_moved'): DataSnapshotObservable<T[keyof T]>
  once(event: 'child_removed'): DataSnapshotObservable<T[keyof T]>
  once(event: EventType): DataSnapshotObservable<T | T[keyof T]> {
    return makeDataSnapshotObservable<T | T[keyof T]>(this._once(event))
  }

  onceValue(): DataSnapshotObservable<T> {
    return this.once('value')
  }

  onceChildAdded(): DataSnapshotObservable<T[keyof T]> {
    return this.once('child_added')
  }

  onceChildChanged(): DataSnapshotObservable<T[keyof T]> {
    return this.once('child_changed')
  }

  onceChildMoved(): DataSnapshotObservable<T[keyof T]> {
    return this.once('child_moved')
  }

  onceChildRemoved(): DataSnapshotObservable<T[keyof T]> {
    return this.once('child_removed')
  }

  on(event: 'value'): DataSnapshotObservable<T>
  on(event: 'child_added'): DataSnapshotObservable<T[keyof T]>
  on(event: 'child_changed'): DataSnapshotObservable<T[keyof T]>
  on(event: 'child_moved'): DataSnapshotObservable<T[keyof T]>
  on(event: 'child_removed'): DataSnapshotObservable<T[keyof T]>
  on(event: EventType): DataSnapshotObservable<T | T[keyof T]> {
    return makeDataSnapshotObservable<T | T[keyof T]>(this._on(event as any))
  }

  onValue(): DataSnapshotObservable<T> {
    return this.on('value')
  }

  onChildAdded(): DataSnapshotObservable<T[keyof T]> {
    return this.on('child_added')
  }

  onChildChanged(): DataSnapshotObservable<T[keyof T]> {
    return this.on('child_changed')
  }

  onChildMoved(): DataSnapshotObservable<T[keyof T]> {
    return this.on('child_moved')
  }

  onChildRemoved(): DataSnapshotObservable<T[keyof T]> {
    return this.on('child_removed')
  }

  isEqual(query: FirebaseQuery<any>): boolean {
    return this.getQueryOrRef().isEqual(query.getQueryOrRef())
  }

  private _once(event: string): Observable<DataSnapshot<T>> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.getQueryOrRef().once(event)),
      (nativeSnapshot: any) => this.makeDataSnapshot(nativeSnapshot)
    )
  }

  private _on(event: string): Observable<DataSnapshot<T>> {
    return this.app.zoneHelper.createObservable(sub => {
      const cb = this.getQueryOrRef().on(
        event, this.getEventHandler(sub),
        (err: any) => sub.error(err)
      )

      return () => this.getQueryOrRef().off(event, cb)
    })
  }

  protected makeDataSnapshot(snapshot: any, prevKey?: string) {
    if (typeof prevKey !== 'undefined') {
      snapshot.prevKey = prevKey
    }
    Object.defineProperty(snapshot, 'ref', {
      get: () => this
    })
    return snapshot
  }

  private getEventHandler(sub: Subscriber<any>, complete?: boolean) {
    return (snapshot: any, prevKey: any) => {
      sub.next(this.makeDataSnapshot(snapshot, prevKey))
      if (complete) {
        sub.complete()
      }
    }
  }

  private getQueryOrRef() {
    if (this.query) {
      return this.query
    }
    return this._ref
  }

  private _call(fnName: string, ...args: any[]) {
    this.app.zoneHelper.runInFirebase(() => {
      if (this.query) {
        this.query = (this.query as any)[fnName](...args)
      }
      else {
        this.query = (this._ref as any)[fnName](...args)
      }
    })
  }
}

export class FirebaseDatabaseRef<T> extends FirebaseQuery<T> {

  get key(): string | null {
    return this._ref.key
  }

  constructor(public parent: FirebaseDatabaseRef<any> | null,
              ref: NativeDatabaseRef,
              app: FirebaseApp) {
    super(ref, app)

    this.wrappedRef = this
  }

  child<P extends keyof T>(path: P): FirebaseDatabaseRef<T[P]> {
    return new FirebaseDatabaseRef<T[P]>(this, this._ref.child(path), this.app)
  }

  set(value: T): Observable<void> {
    return this.app.zoneHelper.wrapPromise<void>(() => this._ref.set(value))
  }

  setPriority(priority: Priority): Observable<void> {
    // There seems to be a bug with the typing for #setPriority(priority, onComplete): Promise
    // The firebase library, in every other case, declares the onComplete function optional since a
    // Promise is returned as well.
    return this.app.zoneHelper.wrapPromise<void>(() => (this._ref as any).setPriority(priority))
  }

  setWithPriority(newVal: T, priority: Priority): Observable<void> {
    return this.app.zoneHelper.wrapPromise<void>(() => this._ref.setWithPriority(newVal, priority))
  }

  push<P extends T[keyof T]>(value?: P): Observable<FirebaseDatabaseRef<P>> {
    const pushRef = this._ref.push(value)
    const ref     = new FirebaseDatabaseRef<P>(this, pushRef, this.app)

    // Only if a value to push was given, use ref as promise, since otherwise
    // pushRef.then will be undefined
    if (value) {
      return mapTo.call(this.app.zoneHelper.wrapPromise<FirebaseDatabaseRef<P>>(() => pushRef), ref)
    }
    return of(ref)
  }

  update(value: T): Observable<void> {
    return this.app.zoneHelper.wrapPromise<void>(() => this._ref.update(value))
  }

  remove(): Observable<void> {
    return this.app.zoneHelper.wrapPromise<void>(() => this._ref.remove())
  }

  transaction(transactionHandler: (node: T | null) => T | null | never,
              applyLocally?: boolean): Observable<TransactionResult<T>> {
    if (Zone) {
      transactionHandler = this.app.zoneHelper.wrap(transactionHandler, 'firebaseRxJS.transaction')
    }
    return this.app.zoneHelper.wrapPromise<TransactionResult<T>>(
      () => new Promise((resolve, reject) => this._ref.transaction(
        transactionHandler,
        (err, committed, snapshot: any) => {
          return err ? reject(err) : resolve({
            committed,
            snapshot: this.makeDataSnapshot(snapshot)
          })
        },
        applyLocally
      ))
    )
  }
}

/**
 * A special object with information about the connection between client and server which can be
 * accessed by using `db.ref('.info')`.
 */
export class InfoSchema {
  /**
   * Whether or not the client is connected to the server.
   */
  connected: boolean
  /**
   * The estimated offset of time in milliseconds between client and server.
   */
  serverTimeOffset: number
}

export class FirebaseDatabase<T> {

  /**
   * A collection of special constants which can be used when writing data. Their values will be
   * substituted on the server with server generated values.
   * E.g {@link FirebaseDatabase.ServerValue.TIMESTAMP} will be substituted for the server time
   * when committing a write.
   */
  static ServerValue = database.ServerValue

  constructor(private db: NativeFirebaseDatabase, private app: FirebaseApp) { }

  /**
   * Get a {@link FirebaseDatabaseRef} to a location in the database.
   *
   * @howToUse
   * If you have defined a database schema you should use {@link FirebaseDatabase.ref} without
   * specifying a path in the database. At least not without giving a type parameter for the data
   * at that location. When using a schema you get the benefit of correct typing when using
   * {@link FirebaseDatabaseRef.child}. The TypeScript compiler can infer from the path segments
   * given to {@link FirebaseDatabaseRef.child} whether the path segment is valid at this
   * location in the database and what the type of the data is that will be returned when
   * fetching it.
   */
  ref(): FirebaseDatabaseRef<T>
  ref(path: '.info'): FirebaseDatabaseRef<InfoSchema>
  ref(path: string): FirebaseDatabaseRef<any>
  ref<F>(path: string): FirebaseDatabaseRef<F>
  ref<F>(path?: string): FirebaseDatabaseRef<F> {
    return new FirebaseDatabaseRef(null, this.db.ref(path), this.app)
  }
}
