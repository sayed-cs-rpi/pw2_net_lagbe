import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole } from './types';
import toast from 'react-hot-toast';

export function useSignUp() {
  const [loading, setLoading] = useState(false);

  async function signUp(email: string, password: string, name: string, role: UserRole = 'complainer') {
    setLoading(true);
    try {
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

export function useSignIn() {
  const [loading, setLoading] = useState(false);

  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
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
