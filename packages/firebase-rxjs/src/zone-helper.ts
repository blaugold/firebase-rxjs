import { Observable } from 'rxjs/Observable'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { Operator } from 'rxjs/Operator'
import { Subscriber } from 'rxjs/Subscriber'
import { TeardownLogic } from 'rxjs/Subscription'

export class ZoneHelper {

  constructor(private firebaseZone?: Zone) {
    if (!firebaseZone) {
      if (typeof Zone !== 'undefined') {
        this.firebaseZone = Zone.root.fork({ name: 'firebase' })
      }
    }
  }

  runInFirebase<T>(fn: () => T): T {
    if (this.firebaseZone) {
      return this.firebaseZone.run<T>(fn)
    }
    return fn()
  }

  wrapSubscribe<T extends Function>(fn: T): T {
    if (this.firebaseZone) {
      return this.firebaseZone.wrap(fn, 'firebaseRxJS.Observable.subscribe')
    }
    return fn
  }

  wrapPromise<T>(promiseFactory: () => firebase.Promise<T>): Observable<T> {
    if (typeof Zone === 'undefined') {
      return fromPromise(this.runInFirebase(promiseFactory) as Promise<T>)
    }

    return new Observable(subscriber => {
      Zone.current.scheduleMacroTask('firebaseRxJS.Promise',
        (err: any, res: any) => {
          if (err) {
            subscriber.error(err)
          } else {
            subscriber.next(res)
            subscriber.complete()
          }
        }, {},
        (task: Task) => {
          const promise = this.runInFirebase(promiseFactory) as Promise<T>
          promise.then(task.invoke.bind(task, null), task.invoke.bind(task))
        },
        (task: Task) => {}
      )
    })
  }

  createObservable<T>(subscribe: (subscriber: Subscriber<T>) => TeardownLogic): Observable<T> {
    const obs = new Observable(this.wrapSubscribe(subscribe))

    if (typeof Zone === 'undefined') {
      return obs
    }

    return obs.lift(new EventTaskOperator())
  }
}

class EventTaskOperator<T> implements Operator<T, T> {

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new EventTaskSubscriber(subscriber, Zone.current))
  }
}

class EventTaskSubscriber<T> extends Subscriber<T> {
  nextTask: EventTask

  constructor(destination: Subscriber<T>, private zone: Zone) {
    super(destination)

    this.nextTask = this.zone.scheduleEventTask(
      'firebaseRxJS.Observable.next',
      (val: T) => this.destination.next!(val),
      {},
      () => {},
      () => {},
    )

    this.add(() => this.zone.cancelTask(this.nextTask))
  }

  protected _next(value: T): void {
    const { nextTask } = this
    this.zone.run(nextTask.invoke, nextTask, [value]);
  }

  protected _error(err: any): void {
    const { destination } = this
    this.zone.scheduleMicroTask('firebaseRxJS.Observable.error',
      destination.error!.bind(destination, err))
  }

  protected _complete(): void {
    const { destination } = this
    this.zone.scheduleMicroTask('firebaseRxJS.Observable.complete',
      destination.complete!.bind(destination))
  }
}
