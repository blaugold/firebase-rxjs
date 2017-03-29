import { InjectionToken } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FirebaseApp, FirebaseAuth, FirebaseDatabase } from 'firebase-rxjs'
import { FirebaseRxJSModule } from './firebase-rxjs-module'

const fbOptionsA = {
  apiKey:            "a",
  authDomain:        "a.firebaseapp.com",
  databaseURL:       "https://a.firebaseio.com",
  storageBucket:     "a.appspot.com",
  messagingSenderId: "99999999999"
}

const fbOptionsB = {
  apiKey:            "b",
  authDomain:        "b.firebaseapp.com",
  databaseURL:       "https://b.firebaseio.com",
  storageBucket:     "b.appspot.com",
  messagingSenderId: "00000000000"
}

describe('Module: FirebaseRxJSModule', () => {

  it('support a primary app', () => {
    TestBed.configureTestingModule({
      imports: [
        FirebaseRxJSModule.primaryApp({
          options: fbOptionsA
        }),
      ]
    })

    const defaultApp      = TestBed.get(FirebaseApp)
    const defaultAuth     = TestBed.get(FirebaseAuth)
    const defaultDatabase = TestBed.get(FirebaseDatabase)

    expect(defaultApp).toBeDefined()
    expect(defaultAuth).toBe(defaultApp.auth())
    expect(defaultDatabase).toBe(defaultApp.database())
  })

  it('support a secondary app', () => {
    const secondAppToken = new InjectionToken('App two')

    TestBed.configureTestingModule({
      imports: [
        FirebaseRxJSModule.primaryApp({
          options: fbOptionsA
        }),
        FirebaseRxJSModule.secondaryApp(secondAppToken, {
          options: fbOptionsB
        }),
      ]
    })

    const defaultApp      = TestBed.get(FirebaseApp)
    const defaultAuth     = TestBed.get(FirebaseAuth)
    const defaultDatabase = TestBed.get(FirebaseDatabase)

    const secondApp: FirebaseApp = TestBed.get(secondAppToken)
    const secondAuth             = secondApp.auth()
    const secondDatabase         = secondApp.database()

    expect(secondApp).toBeDefined()

    expect(defaultApp).not.toBe(secondApp)
    expect(defaultAuth).not.toBe(secondAuth)
    expect(defaultDatabase).not.toBe(secondDatabase)
  })
})
