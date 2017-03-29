import { auth, User, UserInfo } from 'firebase'
import { Observable } from 'rxjs/Observable'
import { map } from 'rxjs/operator/map'
import { FirebaseApp } from './app'
import { AuthCredential, UserCredential } from './interfaces'


export class FirebaseUserCredential {
  credential?: AuthCredential;
  user?: FirebaseUser;

  constructor(cred: UserCredential, app: FirebaseApp) {
    this.credential = cred.credential || undefined;
    this.user       = cred.user ? new FirebaseUser(cred.user, app) : undefined;
  }
}

export class FirebaseUser {

  get displayName(): string | null {
    return this.user.displayName
  }

  get email(): string | null {
    return this.user.email
  }

  get emailVerified(): boolean {
    return this.user.emailVerified;
  }

  get isAnonymous(): boolean {
    return this.user.isAnonymous;
  }

  get photoURL(): string | null {
    return this.user.photoURL;
  }

  get providerData(): (UserInfo | null)[] {
    return this.user.providerData;
  }

  get providerId(): string {
    return this.user.providerId;
  }

  get refreshToken(): string {
    return this.user.refreshToken;
  }

  get uid(): string {
    return this.user.uid
  }

  constructor(private user: User, private app: FirebaseApp) {}

  /**
   * @returns {Observable<void>} - Returns {@link DeleteUserError} if operation fails.
   */
  delete(): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() => this.user.delete());
  }

  getToken(forceRefresh?: boolean): Observable<string> {
    return this.app.zoneHelper.wrapPromise(() => this.user.getToken(forceRefresh));
  }

  /**
   * @returns {Observable<FirebaseUser>} - Returns {@link LinkUserError} if operation fails.
   */
  link(credential: AuthCredential): Observable<FirebaseUser> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.user.link(credential)),
      (user: User) => new FirebaseUser(user, this.app)
    );
  }

  /**
   * @returns {Observable<FirebaseUserCredential>} - Returns {@link LinkUserWithPopupError} if
   *     operation fails.
   */
  linkWithPopup(provider: auth.AuthProvider): Observable<FirebaseUserCredential> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.user.linkWithPopup(provider)),
      (cred: UserCredential) => new FirebaseUserCredential(cred, this.app)
    );
  }

  /**
   * @returns {Observable<FirebaseUserCredential>} - Returns {@link LinkUserWithRedirectError} if
   *     operation fails.
   */
  linkWithRedirect(provider: auth.AuthProvider): Observable<FirebaseUserCredential> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.user.linkWithRedirect(provider)),
      (cred: UserCredential) => new FirebaseUserCredential(cred, this.app)
    );
  }

  /**
   * @returns {Observable<void>} - Returns {@link ReauthenticateError} if operation
   * fails.
   */
  reauthenticate(credential: AuthCredential): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() => this.user.reauthenticate(credential));
  }

  reload(): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() => this.user.reload());
  }

  sendEmailVerification(): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() => this.user.sendEmailVerification());
  }

  unlink(providerId: string): Observable<FirebaseUser> {
    return map.call(
      this.app.zoneHelper.wrapPromise(() => this.user.unlink(providerId)),
      (user: User) => new FirebaseUser(user, this.app)
    );
  }

  /**
   * @returns {Observable<void>} - Returns {@link UpdateEmailError} if operation
   * fails.
   */
  updateEmail(newEmail: string): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() => this.user.updateEmail(newEmail));
  }

  /**
   * @returns {Observable<void>} - Returns {@link UpdatePasswordError} if operation
   * fails.
   */
  updatePassword(newPassword: string): Observable<void> {
    return this.app.zoneHelper.wrapPromise(() => this.user.updatePassword(newPassword));
  }

  updateProfile(profile: { displayName?: string, photoURL?: string }): Observable<void> {
    return this.app.zoneHelper.wrapPromise<void>(() => this.user.updateProfile(profile as any));
  }
}
