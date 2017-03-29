import { database } from 'firebase'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operator/map'
import { mergeMap } from 'rxjs/operator/mergeMap'
import { toArray } from 'rxjs/operator/toArray'
import { FirebaseDatabaseRef } from './database'

export type Priority = number | string | null

export interface PriorityField {
  '.priority'?: Priority // TODO define Priority type
}

export type ExportedSnapshot<T> = {
  [P in keyof T]: ExportedSnapshot<T[P]>
} & PriorityField

// Implements firebase.database.DataSnapshot but with some changes which TypeScript can't express.
export interface DataSnapshot<T> {
  child<P extends keyof T>(path: P): DataSnapshot<T[P]>;
  exists(): boolean;
  exportVal(): ExportedSnapshot<T>;
  forEach(action: (a: DataSnapshot<T[keyof T]>) => boolean): boolean;
  getPriority(): Priority;
  hasChild(path: keyof T): boolean;
  hasChildren(): boolean;
  key: string | null;
  numChildren(): number;
  ref: FirebaseDatabaseRef<T>;
  toJSON(): T | null;
  val(): T | null;

  prevKey?: string;
}

export function makeDataSnapshotObservable<T>(observable: Observable<DataSnapshot<T>>): DataSnapshotObservable<T> {
  return new DataSnapshotObservable<T>(subscriber => {
    const sub = observable.subscribe(subscriber)
    return () => sub.unsubscribe()
  })
}

export class DataSnapshotObservable<T> extends Observable<DataSnapshot<T>> {

  exists(): Observable<boolean> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.exists());
  }

  children(): Observable<DataSnapshotObservable<T[keyof T]>> {
    return map.call(this,
      (snapshot: DataSnapshot<T>) => new DataSnapshotObservable<T[keyof T]>(sub => {
        snapshot.forEach(childSnapshot => {
          sub.next(childSnapshot);
          return false
        })
        sub.complete()
      }))
  }

  /**
   * This operator takes the result of .val() for all children of the snapshot and emits
   * them as an array.
   * Contents of source snapshot:
   * ```
   * {
   *  childA: { prop: 'Hello' },
   *  childB: { prop: 'World!' },
   * }
   * ```
   * Result of operator:
   * ```
   * [
   *  { prop: 'Hello' },
   *  { prop: 'World!' },
   * ]
   * ```
   * @returns {Observable<C[]>}
   */
  toValArray(): Observable<T[keyof T][]> {
    return mergeMap.call(this.children(),
      (children: DataSnapshotObservable<T[keyof T]>) => toArray.call(children.val()))
  }

  values(): Observable<T[keyof T][]> {
    return this.toValArray();
  }

  keys(): Observable<string[]> {
    return mergeMap.call(this.children(),
      (children: DataSnapshotObservable<T[keyof T]>) => toArray.call(children.key()))
  }

  list(): Observable<{ val: T[keyof T], key: string }[]> {
    return mergeMap.call(this.children(),
      (children: DataSnapshotObservable<T[keyof T]>) => toArray.call(children.entry()))
  }

  entry(): Observable<{ val: T, key: string | null }> {
    return map.call(this,
      (snapshot: DataSnapshot<T>) => ({ val: snapshot.val(), key: snapshot.key }))
  }

  key(): Observable<string | null> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.key)
  }

  /**
   * When listening to events such as {@link Event.ChildMoved} the snapshot includes
   * the key of the child before this snapshots one. This operator maps to this key.
   * @returns {Observable<string>}
   */
  prevKey(): Observable<string> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.prevKey)
  }

  val(): Observable<T> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.val())
  }

  getPriority(): Observable<Priority> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.getPriority())
  }

  exportVal(): Observable<ExportedSnapshot<T>> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.exportVal())
  }

  hasChild(path: keyof T): Observable<boolean> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.hasChild(path))
  }

  hasChildren(): Observable<boolean> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.hasChildren())
  }

  numChildren(): Observable<number> {
    return map.call(this, (snapshot: DataSnapshot<T>) => snapshot.numChildren())
  }

  child<P extends keyof T>(path: P): DataSnapshotObservable<T[P]> {
    return new DataSnapshotObservable<T[P]>(sub => {
      const subscription = map.call(this,
        (snapshot: DataSnapshot<T>) => snapshot.child(path))
        .subscribe(sub)

      return () => subscription.unsubscribe()
    })
  }
}
