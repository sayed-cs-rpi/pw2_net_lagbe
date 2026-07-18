import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { getAuthInstance, getDbInstance } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole } from './types';
import toast from 'react-hot-toast';

export function useSignUp() {
  const [loading, setLoading] = useState(false);

  async function signUp(email: string, password: string, name: string, role: UserRole = 'complainer') {
    setLoading(true);
    try {
      const auth = getAuthInstance();
      const db = getDbInstance();
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, { displayName: name });
      
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        name,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success('Account created successfully!');
      return result.user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { signUp, loading };
}

export function useAdminCreateUser() {
  const [loading, setLoading] = useState(false);

  async function adminCreateUser(email: string, password: string, name: string, role: UserRole) {
    setLoading(true);
    try {
      const auth = getAuthInstance();
      const db = getDbInstance();
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, { displayName: name });
      
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        name,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success(`User created successfully as ${role}!`);
      
      // Sign out the newly created user so admin stays signed in
      await signOut(auth);
      
      return result.user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { adminCreateUser, loading };
}

export function useSignIn() {
  const [loading, setLoading] = useState(false);

  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      const auth = getAuthInstance();
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      return result.user;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { signIn, loading };
}
