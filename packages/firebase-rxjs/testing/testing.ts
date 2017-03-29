export interface TestFrameworkCallbacks {
  success(): void
  failure(err?: any): void
}

export function asyncTestWrapper(zoneNamePostFix: string,
                                 test: () => any,
                                 callbacks: TestFrameworkCallbacks,
                                 waitForEventTasks: boolean) {
  let startZone = Zone.current

  const longStackTraceSpec = (Zone as any)['longStackTraceZoneSpec']
  if (longStackTraceSpec) {
    startZone = startZone.fork(longStackTraceSpec)
  }

  startZone.fork(new AsyncTestZoneSpec(callbacks.success,
    callbacks.failure,
    zoneNamePostFix,
    waitForEventTasks))
    .run(() => {
      const res = test()

      if (typeof res === 'object' && typeof (res as any).then === 'function') {
        const promise = res as Promise<any>
        promise.then(callbacks.success, callbacks.failure)
      }
    })
}

// Copied from zone.js/lib/zone-spec/async-test.ts and extended.
class AsyncTestZoneSpec implements ZoneSpec {
  _finishCallback: Function;
  _failCallback: Function;
  _waitForEvents: boolean;
  _pendingMicroTasks: boolean = false;
  _pendingMacroTasks: boolean = false;
  _pendingEventTasks: boolean = false;
  _alreadyErrored: boolean    = false;
  runZone                     = Zone.current;

  constructor(finishCallback: Function,
              failCallback: Function,
              namePrefix: string,
              waitForEvents: boolean) {
    this._finishCallback = finishCallback;
    this._failCallback   = failCallback;
    this._waitForEvents  = waitForEvents;
    this.name            = 'asyncTestZone for ' + namePrefix;
  }

  _hasPendingTasks() {
    if (this._waitForEvents && this._pendingEventTasks) {
      return true
    }
    return this._pendingMicroTasks || this._pendingMacroTasks
  }

  _finishCallbackIfDone() {
    if (!this._hasPendingTasks()) {
      // We do this because we would like to catch unhandled rejected promises.
      this.runZone.run(() => {
        setTimeout(() => {
          if (!this._alreadyErrored && !this._hasPendingTasks()) {
            this._finishCallback();
          }
        }, 0);
      });
    }
  }

  // ZoneSpec implementation below.

  name: string;

  // Note - we need to use onInvoke at the moment to call finish when a test is
  // fully synchronous. TODO(juliemr): remove this when the logic for
  // onHasTask changes and it calls whenever the task queues are dirty.
  onInvoke(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
           delegate: Function,
           applyThis: any, applyArgs: any[], source: string): any {
    try {
      return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
    } finally {
      this._finishCallbackIfDone();
    }
  }

  onHandleError(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                error: any): boolean {
    // Let the parent try to handle the error.
    const result = parentZoneDelegate.handleError(targetZone, error);
    if (result) {
      this._failCallback(error);
      this._alreadyErrored = true;
    }
    return false;
  }

  onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
    delegate.hasTask(target, hasTaskState);
    if (hasTaskState.change == 'microTask') {
      this._pendingMicroTasks = hasTaskState.microTask;
      this._finishCallbackIfDone();
    } else if (hasTaskState.change == 'macroTask') {
      this._pendingMacroTasks = hasTaskState.macroTask;
      this._finishCallbackIfDone();
    } else if (hasTaskState.change == 'eventTask') {
      this._pendingEventTasks = hasTaskState.eventTask;
      this._finishCallbackIfDone();
    }
  }
}
