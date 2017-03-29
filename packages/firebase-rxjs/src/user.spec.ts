import { async } from '../testing/jasmine'
import { FirebaseApp } from './app'
import { FirebaseAuth } from './auth'
import { FirebaseUser } from './user'

describe('FirebaseUser', () => {

  describe('Password & Email', () => {
    const userCreds = { email: randomEmail(), password: 'password' };
    const profile   = { displayName: 'Bob', photoURL: 'photo://url' }
    let app: FirebaseApp;
    let auth: FirebaseAuth;
    let user: FirebaseUser;

    it('should sign up', async(async () => {
      app  = new FirebaseApp({ options: firebaseConfig });
      auth = app.auth();

      user = await auth.createUserWithEmailAndPassword(userCreds.email, userCreds.password)
        .toPromise()
    }));

    it('should update profile', async(async () => {
      await user.updateProfile(profile).toPromise();
    }));

    it('should forward User fields', () => {
      expect(user.isAnonymous).toBeFalsy();
      expect(user.email).toEqual(userCreds.email);
      expect(user.displayName).toEqual(profile.displayName);
      expect(user.photoURL).toEqual(profile.photoURL);
      expect(user.emailVerified).toBe(false);
      expect(user.providerId).toBe('firebase');
      expect(user.uid.length > 10).toBeTruthy();
      expect(user.refreshToken).toBeDefined();
      expect(user.providerData[0]!.uid).toEqual(user.email as string)
    })

    it('should get token', async(async () => {
      const token = await user.getToken(true).toPromise();
      expect(typeof token === 'string').toBeTruthy()
    }))

    // Only applicable for providers other than password.
    it('should reauthenticate', () => pending())

    it('should link', () => pending())
    it('should linkWithPopup', () => pending())
    it('should linkWithRedirect', () => pending())
    it('should unlink', () => pending())

    it('should reload user profile', async(async () => {
      await user.reload().toPromise()
    }))

    it('should send email verification', async(async () => {
      await user.sendEmailVerification().toPromise()
    }))

    it('should update email', async(async () => {
      userCreds.email = randomEmail();
      await user.updateEmail(userCreds.email).toPromise();
      expect(user.email).toBe(userCreds.email);
    }))

    it('should update password', async(async () => {
      userCreds.password = randomString();
      await user.updatePassword(userCreds.password).toPromise();
      user = await auth.signInWithEmailAndPassword(userCreds.email, userCreds.password).toPromise();
      expect(user).toBeDefined();
    }))

    it('should delete user', async(async () => {
      await user.delete().toPromise();
    }));
  });
});


function randomString() {
  return Math.random().toString(36).substring(7);
}

function randomEmail() {
  return `${randomString()}@yopmail.com`;
}