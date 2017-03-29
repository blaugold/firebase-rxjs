import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core'
import { FirebaseApp, FirebaseAppConfig, FirebaseAuth, FirebaseDatabase } from 'firebase-rxjs'

/** @internal */
export function appFactory(config: FirebaseAppConfig) {
  return new FirebaseApp(config)
}

/** @internal */
export function authFactory(app: FirebaseApp) {
  return app.auth()
}

/** @internal */
export function databaseFactory(app: FirebaseApp) {
  return app.database()
}

@NgModule({})
export class FirebaseRxJSModule {
  /**
   * Provides a firebase app which will be be injected for {@link FirebaseApp}. Further the app's
   * {@link FirebaseAuth} and {@link FirebaseDatabase} can be injected in the same way.
   * @param config Firebase app config.
   */
  static primaryApp(config: FirebaseAppConfig): ModuleWithProviders {

    return {
      ngModule:  FirebaseRxJSModule,
      providers: [
        {
          provide:  'firebase-config-' + config.options.apiKey,
          useValue: config
        },
        {
          provide:    FirebaseApp,
          useFactory: appFactory,
          deps:       ['firebase-config-' + config.options.apiKey]
        },
        {
          provide:    FirebaseAuth,
          useFactory: authFactory,
          deps:       [FirebaseApp]
        },
        {
          provide:    FirebaseDatabase,
          useFactory: databaseFactory,
          deps:       [FirebaseApp]
        }
      ]
    }
  }

  /**
   * Provides a {@link FirebaseApp} which will be injected for token.
   *
   * @param token Token for which {@link FirebaseApp} will be injected.
   * @param config Firebase app config.
   */
  static secondaryApp(token: InjectionToken<FirebaseApp>, config: FirebaseAppConfig) {
    return {
      ngModule:  FirebaseRxJSModule,
      providers: [
        {
          provide:  'firebase-config-' + config.options.apiKey,
          useValue: config
        },
        {
          provide:    token,
          useFactory: appFactory,
          deps:       ['firebase-config-' + config.options.apiKey,]
        }
      ]
    }
  }
}
