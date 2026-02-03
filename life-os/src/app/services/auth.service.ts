import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);
    
    constructor(private auth: Auth){
      onAuthStateChanged(auth, (user) => this.user$.next(user));
    }
    get currentUser() {
      return this.user$.asObservable();
    }

    async login(email: string, password: string) {
      return signInWithEmailAndPassword(this.auth, email, password);
    } 

    async register(email: string, password: string) {
      return createUserWithEmailAndPassword(this.auth, email, password);
    } 

    async googleSignin() {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      console.log("googleSignin", result);
      return result.user;
    } 

    async facebookSignin() {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    }

    async changePassword(currentPassword: string, newPassword: string) {
      const user = this.auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user is currently signed in');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        return { success: true, message: 'Password updated successfully' };
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
          throw new Error('Current password is incorrect');
        } else if (error.code === 'auth/weak-password') {
          throw new Error('New password is too weak');
        } else {
          throw new Error(error.message || 'Failed to change password');
        }
      }
    }

    async logout() {
      return signOut(this.auth);
    }
}
