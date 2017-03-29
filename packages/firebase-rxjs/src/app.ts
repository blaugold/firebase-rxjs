import * as firebase from 'firebase'
import { Observable } from 'rxjs/Observable'
import { FirebaseAuth } from './auth'
import { FirebaseDatabase } from './database'
import { NativeFirebaseApp } from './native-firebase'
import { ZoneHelper } from './zone-helper'

let lastAppId = 0

export interface FirebaseAppConfig {
  /**
   * Name of the app internally used by firebase. If non is given one will be generated.
   */
  name?: string
  /**
   * Firebase App configuration.
   */
  options: {
    apiKey: string
    authDomain?: string
    databaseURL?: string
    storageBucket?: string
    messagingSenderId?: string
  }
}

export interface Extras {
  firebaseZone?: any
}

export class FirebaseApp {
  nativeApp: NativeFirebaseApp

  private _auth: FirebaseAuth
  private _database: FirebaseDatabase<any>

  /** @internal */
  zoneHelper: ZoneHelper

  constructor(public config: FirebaseAppConfig, { firebaseZone }: Extras = {}) {
    config.name     = config.name || `app-${lastAppId++}`
    this.zoneHelper = new ZoneHelper(firebaseZone)
    this.nativeApp  = this.zoneHelper.runInFirebase(() =>
      firebase.initializeApp(config.options, config.name))
  }

  delete(): Observable<void> {
    return this.zoneHelper.wrapPromise(() => this.nativeApp.delete())
  }

  /**
   * Get the with this {@link FirebaseApp} associated {@link FirebaseAuth} instance.
   */
  auth(): FirebaseAuth {
    if (!this._auth) {
      this._auth =
        new FirebaseAuth(this.zoneHelper.runInFirebase(() => this.nativeApp.auth()), this)
    }
    return this._auth
  }

  /**
   * Get the with this {@link FirebaseApp} associated {@link FirebaseDatabase}.
   *
   * The type parameter T is used to supply the schema of your database. If you do not want to
   * use one set it to `any`. Using a schema provides type safety when accessing the database.
   */
  database<T>(): FirebaseDatabase<T> {
    if (!this._database) {
      this._database =
        new FirebaseDatabase(this.zoneHelper.runInFirebase(() => this.nativeApp.database()), this)
    }
    return this._database
  }
}