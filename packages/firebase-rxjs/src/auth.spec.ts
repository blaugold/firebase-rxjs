import { asyncEvents } from '../testing/jasmine'
/* tslint:disable:no-unused-variable */
import { FirebaseApp } from './app'
import { FirebaseAuth } from './auth'

let firebaseApp: FirebaseApp
let auth: FirebaseAuth

const userFixture = {
  email:    'user@foobar.foobar',
  password: 'onetwothree'
}

describe('Service: FirebaseAuth', () => {
  beforeEach(() => {
    firebaseApp = new FirebaseApp({ options: firebaseConfig })
    auth        = firebaseApp.auth()
  });

  afterEach(done => {
    firebaseApp.delete().toPromise().then(done, done)
  })

  it('should run observable of #user as event task', done => {
    let eventTaskScheduled         = false
    let eventTaskCanceledScheduled = false
    Zone.current.fork({
      name:           'user-observable-test',
      onScheduleTask: (parentZoneDelegate, currentZone, targetZone, task) => {
        if (task.source === 'firebaseRxJS.Observable.next') {
          eventTaskScheduled = true
        }
        return parentZoneDelegate.scheduleTask(targetZone, task)
      },
      onCancelTask:   (parentZoneDelegate, currentZone, targetZone, task) => {
        if (task.source === 'firebaseRxJS.Observable.next') {
          eventTaskCanceledScheduled = true
        }
        return parentZoneDelegate.cancelTask(targetZone, task)
      }
    }).run(() => {
      auth.signOut().toPromise().then(() => {
        auth.user.take(1).subscribe(user => {
          expect(user).toBeNull()
          setTimeout(() => {
            expect(eventTaskCanceledScheduled).toBeTruthy('eventTaskCanceledScheduled')
            done()
          }, 0)
        })
        expect(eventTaskScheduled).toBeTruthy('eventTaskScheduled')
      })
    })
  })

  it('should support observing authentication state', asyncEvents(async () => {
    let user

    await auth.signOut().toPromise()

    // Tests how state changes are observed
    auth.user.bufferCount(3).take(1).subscribe(events => {
      expect(events[0]).toBeNull() // Initial state
      expect(events[1].email).toBe(userFixture.email) // User signs in
      expect(events[2]).toBeNull() // User signs out
    })

    // User is singed out so null should be replayed
    user = await auth.user.take(1).toPromise()
    expect(user).toBeNull()

    try {
      user = await auth.signInWithEmailAndPassword(
        userFixture.email,
        userFixture.password).toPromise()
    } catch (e) {
      user = await auth.createUserWithEmailAndPassword(
        userFixture.email,
        userFixture.password).toPromise()
    }

    // User is singed in so user should be replayed
    user = await auth.user.take(1).toPromise()
    expect(user.email).toBe(userFixture.email)

    await auth.signOut().toPromise()
  }))
});
