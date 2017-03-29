import { app, auth, database } from 'firebase'

export abstract class NativeFirebaseApp implements app.App {
  name: string;
  options: Object;

  abstract auth(): firebase.auth.Auth;

  abstract database(): firebase.database.Database;

  abstract delete(): firebase.Promise<any>;

  abstract storage(): firebase.storage.Storage;

  abstract messaging(): firebase.messaging.Messaging;
}

export abstract class NativeFirebaseAuth implements auth.Auth {
  app: firebase.app.App;

  abstract currentUser: firebase.User | null;

  abstract applyActionCode(code: string): firebase.Promise<any>;

  abstract checkActionCode(code: string): firebase.Promise<any>;

  abstract confirmPasswordReset(code: string, newPassword: string): firebase.Promise<any>;

  abstract createCustomToken(uid: string, developerClaims?: Object | null): string;

  abstract createUserWithEmailAndPassword(email: string, password: string): firebase.Promise<any>;

  abstract fetchProvidersForEmail(email: string): firebase.Promise<any>;

  abstract getRedirectResult(): firebase.Promise<any>;

  abstract onAuthStateChanged(nextOrObserver: Object, opt_error?: (a: firebase.auth.Error) => any,
                              opt_completed?: () => any): () => any;

  abstract sendPasswordResetEmail(email: string): firebase.Promise<any>;

  abstract signInAnonymously(): firebase.Promise<any>;

  abstract signInWithCredential(credential: firebase.auth.AuthCredential): firebase.Promise<any>;

  abstract signInWithCustomToken(token: string): firebase.Promise<any>;

  abstract signInWithEmailAndPassword(email: string, password: string): firebase.Promise<any>;

  abstract signInWithPopup(provider: firebase.auth.AuthProvider): firebase.Promise<any>;

  abstract signInWithRedirect(provider: firebase.auth.AuthProvider): firebase.Promise<any>;

  abstract signOut(): firebase.Promise<any>;

  abstract verifyIdToken(idToken: string): firebase.Promise<any>;

  abstract verifyPasswordResetCode(code: string): firebase.Promise<any>;
}

export abstract class NativeFirebaseDatabase implements database.Database {
  app: firebase.app.App;

  abstract goOffline(): any;

  abstract goOnline(): any;

  abstract ref(path?: string): firebase.database.Reference;

  abstract refFromURL(url: string): firebase.database.Reference;
}

export interface FirebaseError extends Error {
  code: string
  message: string
  name: string
  stack: string
}
