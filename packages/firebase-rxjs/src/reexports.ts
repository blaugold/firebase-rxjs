import { auth } from 'firebase'
import { ExtendedDataSnapshot } from './data-snapshot-observable'

export type DataSnapshot = ExtendedDataSnapshot

export type AuthProvider = auth.AuthProvider
export type AuthCredential = auth.AuthCredential

export class GoogleAuthProvider extends auth.GoogleAuthProvider {}
export class FacebookAuthProvider extends auth.FacebookAuthProvider {}
export class GithubAuthProvider extends auth.GithubAuthProvider {}
export class EmailAuthProvider extends auth.EmailAuthProvider {}
export class TwitterAuthProvider extends auth.TwitterAuthProvider {}
