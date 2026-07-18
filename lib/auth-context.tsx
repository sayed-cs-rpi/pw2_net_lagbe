'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db, isFirebaseConfigured, requestNotificationPermission } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, UserRole } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      console.warn('[v0] Firebase not configured. Please add Firebase environment variables.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Request notification permission and store FCM token
            const fcmToken = await requestNotificationPermission();
            if (fcmToken && (!userData.fcmToken || userData.fcmToken !== fcmToken)) {
              await updateDoc(doc(db, 'users', firebaseUser.uid), { fcmToken });
            }
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || '',
              role: userData.role || 'complainer',
              createdAt: userData.createdAt?.toDate?.() || new Date(),
              updatedAt: userData.updatedAt?.toDate?.() || new Date(),
              avatar: userData.avatar,
              fcmToken: fcmToken || userData.fcmToken,
            });
          }
        } catch (error) {
          console.error('[v0] Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleSignOut() {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('[v0] Sign out error:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
