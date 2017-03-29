import * as firebase from 'firebase'
import { database } from 'firebase'
import { FirebaseDatabaseRef } from './database'
import { FirebaseError } from './native-firebase'
import AuthCredential = firebase.auth.AuthCredential
import { auth } from 'firebase'

/*
 * App Interfaces
 */

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

/*
 * Database Interfaces
 */

export type Priority = number | string | null

export interface PriorityField {
  '.priority'?: Priority // TODO define Priority type
}

export type ExportedSnapshot<T> = {
  [P in keyof T]: ExportedSnapshot<T[P]>
  } & PriorityField

// Implements firebase.database.DataSnapshot but with some changes which TypeScript can't express.
export interface DataSnapshot<T> {
  child<P extends keyof T>(path: P): DataSnapshot<T[P]>;
  exists(): boolean;
  exportVal(): ExportedSnapshot<T>;
  forEach(action: (a: DataSnapshot<T[keyof T]>) => boolean): boolean;
  getPriority(): Priority;
  hasChild(path: keyof T): boolean;
  hasChildren(): boolean;
  key: string | null;
  numChildren(): number;
  ref: FirebaseDatabaseRef<T>;
  toJSON(): T | null;
  val(): T | null;

  prevKey?: string;
}

export type NativeDatabaseRef = database.Reference
export type Query = database.Query

/**
 * Events which can be listened for.
 */
export type EventType =
  'value'
  | 'child_added'
  | 'child_changed'
  | 'child_removed'
  | 'child_moved'

export interface TransactionResult<T> {
  committed: boolean,
  snapshot: DataSnapshot<T> | null
}

/*
 *  Auth Interfaces
 */

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

export type AuthProvider = auth.AuthProvider
export type AuthCredential = auth.AuthCredential

export class GoogleAuthProvider extends auth.GoogleAuthProvider {}
export class FacebookAuthProvider extends auth.FacebookAuthProvider {}
export class GithubAuthProvider extends auth.GithubAuthProvider {}
export class EmailAuthProvider extends auth.EmailAuthProvider {}
export class TwitterAuthProvider extends auth.TwitterAuthProvider {}

/*
 * User Interfaces
 */
export interface DeleteUserError extends FirebaseError {
  code: AuthErrorCodeType
    | 'auth/requires-recent-login'
}

export interface LinkUserError extends FirebaseError {
  code: AuthErrorCodeType
    | 'auth/provider-already-linked'
    | 'auth/invalid-credential'
    | 'auth/credential-already-in-use'
    | 'auth/email-already-in-use'
    | 'auth/operation-not-allowed'
    | 'auth/invalid-email'
    | 'auth/wrong-password'
}

export interface LinkUserWithPopupError extends FirebaseError {
  code: AuthErrorCodeType
    | 'auth/auth-domain-config-required'
    | 'auth/cancelled-popup-request'
    | 'auth/credential-already-in-use'
    | 'auth/email-already-in-use'
    | 'auth/operation-not-allowed'
    | 'auth/popup-blocked'
    | 'auth/operation-not-supported-in-this-environment'
    | 'auth/popup-closed-by-user'
    | 'auth/provider-already-linked'
    | 'auth/unauthorized-domain'
}

export interface LinkUserWithRedirectError extends FirebaseError {
  code: AuthErrorCodeType
    | 'auth/auth-domain-config-required'
    | 'auth/operation-not-supported-in-this-environment'
    | 'auth/provider-already-linked'
    | 'auth/unauthorized-domain'
}

export interface ReauthenticateError extends FirebaseError {
  code: AuthErrorCodeType
    | 'auth/user-mismatch'
    | 'auth/user-not-found'
    | 'auth/invalid-credential'
    | 'auth/invalid-email'
    | 'auth/wrong-password'
}

export interface UpdateEmailError extends FirebaseError {
  code: AuthErrorCodeType
    | 'auth/invalid-email'
    | 'auth/email-already-in-use'
    | 'auth/requires-recent-login'
}

export interface UpdatePasswordError extends FirebaseError {
  code: AuthErrorCodeType
    | 'auth/weak-password'
    | 'auth/requires-recent-login'
}

export type UserCredential = auth.UserCredential;
