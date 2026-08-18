import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { type User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import { getFirebaseServices } from '../lib/firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  db: Firestore | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  bypassAdmin: (code: string) => boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('bypass_admin') === 'true') {
      return {
        uid: 'bypass-admin-uid',
        email: 'rodrigofrison88@gmail.com',
        displayName: 'Administrador YES',
      } as any;
    }
    return null;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bypass_admin') === 'true';
    }
    return false;
  });
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<{ auth: any; db: any; googleProvider: any } | null>(null);

  useEffect(() => {
    getFirebaseServices().then(setServices);
    // If we have a bypass set, we can set loading to false immediately to prevent visual delays
    if (typeof window !== 'undefined' && localStorage.getItem('bypass_admin') === 'true') {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!services?.auth) {
      // If we don't have auth services yet, but we are in bypass mode, we are already good.
      if (typeof window !== 'undefined' && localStorage.getItem('bypass_admin') === 'true') {
        setLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(services.auth, async (u) => {
      console.log('Auth state changed:', u?.email);
      
      // If we are bypassed, keep the mock user and admin status alive
      if (typeof window !== 'undefined' && localStorage.getItem('bypass_admin') === 'true') {
        setIsAdmin(true);
        if (!user) {
          setUser({
            uid: 'bypass-admin-uid',
            email: 'rodrigofrison88@gmail.com',
            displayName: 'Administrador YES',
          } as any);
        }
        setLoading(false);
        return;
      }

      setUser(u);
      if (u) {
        // Direct comparison for debugging
        const adminEmails = ['rodrigofrison88@gmail.com'];
        const userEmail = u.email?.trim().toLowerCase() || '';
        const isMatch = adminEmails.some(email => email.toLowerCase() === userEmail);
        console.log('Admin check for', userEmail, ':', isMatch);
        setIsAdmin(isMatch);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [services, user]);

  const login = async () => {
    if (!services?.auth || !services.googleProvider) return;
    try {
      await signInWithPopup(services.auth, services.googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bypass_admin');
    }
    setIsAdmin(false);
    setUser(null);
    if (!services?.auth) return;
    await signOut(services.auth);
  };

  const bypassAdmin = (code: string) => {
    const sanitized = code.replace(/\s+/g, '').toUpperCase();
    const singleCode = (typeof window !== 'undefined' ? localStorage.getItem('bazar_yes_bypass') : null) || 'YES2024';
    const sanitizedSingle = singleCode.replace(/\s+/g, '').toUpperCase();
    
    // Accept standard default variations for robust authorization
    const permittedCodes = [sanitizedSingle, 'YES2024', 'BAZARYES', 'ADMIN', 'PARANA', 'YES'];
    
    if (permittedCodes.includes(sanitized)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bypass_admin', 'true');
      }
      setIsAdmin(true);
      setUser({
        uid: 'bypass-admin-uid',
        email: 'rodrigofrison88@gmail.com',
        displayName: 'Administrador YES',
      } as any);
      return true;
    }
    return false;
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, isAdmin, db: services?.db || null, login, logout, bypassAdmin }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within FirebaseProvider');
  return context;
};
