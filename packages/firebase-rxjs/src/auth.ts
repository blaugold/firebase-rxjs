import { auth, User } from 'firebase'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operator/map'
import { FirebaseApp } from './app'
import { ActionCodeInfo, AuthCredential, AuthProvider } from './interfaces'
import { NativeFirebaseAuth } from './native-firebase'
import { FirebaseUser, FirebaseUserCredential } from './user'

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
