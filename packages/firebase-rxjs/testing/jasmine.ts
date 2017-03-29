import { asyncTestWrapper } from './testing'

export function async(test: () => void, waitForEventTasks = false): (done: () => void) => void {
  return function (done) {
    asyncTestWrapper('jasmine',
      test,
      {
        failure(err) {
          fail(err);
          done()
        },
        success: function () {
          done()
        }
      },
      waitForEventTasks)
  }
}

export function asyncEvents(test: () => void): (done: () => void) => void {
  return async(test, true)
}