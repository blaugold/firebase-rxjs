import { auth, User } from 'firebase'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operator/map'
import { FirebaseApp } from './app'
import { FirebaseError, NativeFirebaseAuth } from './native-firebase'
import { AuthCredential, AuthProvider } from './reexports'
import { FirebaseUser, FirebaseUserCredential } from './user'

/**
 * General error codes which may occur with every operation.
 */
export type AuthErrorCodeType =
  'auth/app-deleted'
  | 'auth/app-not-authorized'
  | 'auth/argument-error'
  | 'auth/invalid-api-key'
  | 'auth/invalid-user-token'
  | 'auth/network-request-failed'
  | 'auth/operation-not-allowed'
  | 'auth/requires-recent-login'
  | 'auth/too-many-requests'
  | 'auth/unauthorized-domain'
  | 'auth/user-disabled'
  | 'auth/user-token-expired'
  | 'auth/web-storage-unsupported'

export interface AuthError extends FirebaseError {
  code: AuthErrorCodeType | string
  email?: string
  credential?: AuthCredential
}

export interface ActionCodeError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/expired-action-code'
    | 'auth/invalid-action-code'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.confirmPasswordReset}
 */
export interface ConfirmPasswordResetError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/expired-action-code'
    | 'auth/invalid-action-code'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
    | 'auth/weak-password'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.createUserWithEmailAndPassword}
 */
export interface CreateUserWithEmailAndPasswordError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/email-already-in-use'
    | 'auth/invalid-email'
    | 'auth/operation-not-allowed'
    | 'auth/weak-password'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.fetchProvidersForEmail}
 */
export interface FetchProvidersForEmailError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/invalid-email'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.getRedirectResult}
 */
export interface GetRedirectResultError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/invalid-email'
    | 'auth/user-not-found'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.sendPasswordResetEmail}
 */
export interface SendPasswordResetEmailError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/invalid-email'
    | 'auth/user-not-found'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.signInAnonymously}
 */
export interface SignInAnonymouslyError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/operation-not-allowed'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.signInWithCredential}
 */
export interface SignInWithCredentialError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/account-exists-with-different-credential'
    | 'auth/invalid-credential'
    | 'auth/operation-not-allowed'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.signInWithCustomToken}
 */
export interface SignInWithCustomTokenError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/custom-token-mismatch'
    | 'auth/invalid-custom-token'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.signInWithEmailAndPassword}
 */
export interface SignInWithEmailAndPasswordError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/invalid-email'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.signInWithPopup}
 */
export interface SignInWithPopupError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/account-exists-with-different-credential'
    | 'auth/auth-domain-config-required'
    | 'auth/cancelled-popup-request'
    | 'auth/operation-not-allowed'
    | 'auth/operation-not-supported-in-this-environment'
    | 'auth/popup-blocked'
    | 'auth/popup-closed-by-user'
    | 'auth/unauthorized-domain'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.signInWithRedirect}
 */
export interface SignInWithRedirectError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/auth-domain-config-required'
    | 'auth/operation-not-supported-in-this-environment'
    | 'auth/unauthorized-domain'
}

/**
 * Error codes which can occur when calling {@link FirebaseAuth.verifyPasswordResetCode}
 */
export interface VerifyPasswordResetCodeError extends AuthError {
  code: AuthErrorCodeType
    | 'auth/expired-action-code'
    | 'auth/invalid-action-code'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
}

export interface ActionCodeInfo {
  email: string
}

export class FirebaseAuth {

  /**
   * Observable which emits when authorization state of the user changes.
   */
  get user(): Observable<FirebaseUser | null> {
    return map.call(
      this.app.zoneHelper.createObservable(
        (observer) => this.fbAuth.onAuthStateChanged(observer)
      ),
      (user: firebase.User) => user ? new FirebaseUser(user, this.app) : null
    )
  }

  constructor(private fbAuth: NativeFirebaseAuth,
              private app: FirebaseApp) {}

  /**
   * @param code
   * @returns {Observable<void>} - Returns {@link ActionCodeError} if operation fails.
   */
  applyActionCode(code: string): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() => this.fbAuth.applyActionCode(code))
  }

  /**
   * @param code
   * @returns {Observable<ActionCodeInfo>} - Returns {@link ActionCodeError} if operation fails.
   */
  checkActionCode(code: string): Observable<ActionCodeInfo> {
    return this.app.zoneHelper.wrapPromise(() => this.fbAuth.checkActionCode(code))
  }

  /**
   * @param code
   * @param newPassword
   * @returns {Observable<void>} - Returns {@link ConfirmPasswordResetError} if operation fails.
   */
  confirmPasswordReset(code: string, newPassword: string): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() =>
      this.fbAuth.confirmPasswordReset(code, newPassword))
  }

  /**
   *
   * @param email
   * @param password
   * @returns {Observable<FirebaseUser>} - Returns {@link CreateUserWithEmailAndPasswordError} if
   *     operation fails.
   */
  createUserWithEmailAndPassword(email: string, password: string): Observable<FirebaseUser> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() =>
        this.fbAuth.createUserWithEmailAndPassword(email, password)),
      (user: User) => new FirebaseUser(user, this.app)
    )
  }

  /**
   *
   * @param email
   * @returns {Observable<string[]>} - Returns {@link FetchProvidersForEmailError} if operation
   *     fails.
   */
  fetchProvidersForEmail(email: string): Observable<string[]> {
    return this.app.zoneHelper.wrapPromise(() => this.fbAuth.fetchProvidersForEmail(email))
  }

  /**
   * @returns {Observable<FirebaseUserCredential>} - Returns {@link GetRedirectResultError} if
   *     operation fails.
   */
  getRedirectResult(): Observable<FirebaseUserCredential> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.fbAuth.getRedirectResult()),
      (cred: auth.UserCredential) => new FirebaseUserCredential(cred, this.app)
    );
  }

  /**
   * @param email
   * @returns {Observable<void>} - Returns {@link SendPasswordResetEmailError} if operation fails.
   */
  sendPasswordResetEmail(email: string): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() => this.fbAuth.sendPasswordResetEmail(email))
  }

  /**
   *
   * @returns {Observable<FirebaseUser>} - Returns {@link SignInAnonymouslyError} if operation
   *     fails.
   */
  signInAnonymously(): Observable<FirebaseUser> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.fbAuth.signInAnonymously()),
      (user: User) => new FirebaseUser(user, this.app)
    );
  }

  /**
   * @param credential
   * @returns {Observable<FirebaseUser>} - Returns {@link SignInWithCredentialError} if operation
   *     fails.
   */
  signInWithCredential(credential: AuthCredential): Observable<FirebaseUser> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.fbAuth.signInWithCredential(credential)),
      (user: User) => new FirebaseUser(user, this.app)
    );
  }

  /**
   * @param token
   * @returns {Observable<FirebaseUser>} - Returns {@link SignInWithCustomTokenError} if operation
   *     fails.
   */
  signInWithCustomToken(token: string): Observable<FirebaseUser> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.fbAuth.signInWithCustomToken(token)),
      (user: User) => new FirebaseUser(user, this.app)
    );
  }

  /**
   * @param email
   * @param password
   * @returns {Observable<FirebaseUser>} - Returns {@link SignInWithEmailAndPasswordError} if
   *     operation fails.
   */
  signInWithEmailAndPassword(email: string, password: string): Observable<FirebaseUser> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() =>
        this.fbAuth.signInWithEmailAndPassword(email, password)),
      (user: User) => new FirebaseUser(user, this.app)
    )
  }

  /**
   * @param provider
   * @returns {Observable<FirebaseUser>} - Returns {@link SignInWithPopupError} if operation fails.
   */
  signInWithPopup(provider: AuthProvider): Observable<FirebaseUserCredential> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.fbAuth.signInWithPopup(provider)),
      (cred: auth.UserCredential) => new FirebaseUserCredential(cred, this.app)
    );
  }

  /**
   * @param provider
   * @returns {Observable<FirebaseUser>} - Returns {@link SignInWithRedirectError} if operation
   *     fails.
   */
  signInWithRedirect(provider: AuthProvider): Observable<FirebaseUserCredential> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.fbAuth.signInWithRedirect(provider)),
      (cred: auth.UserCredential) => new FirebaseUserCredential(cred, this.app)
    );
  }

  signOut(): Observable<void> {
    return this.app.zoneHelper.wrapPromise<void>(() => this.fbAuth.signOut())
  }

  /**
   *
   * @param code
   * @returns {Observable<string>} - Returns {@link VerifyPasswordResetCodeError} if operation
   * fails.
   */
  verifyPasswordResetCode(code: string): Observable<string> {
    return this.app.zoneHelper.wrapPromise(() => this.fbAuth.verifyPasswordResetCode(code))
  }
}
