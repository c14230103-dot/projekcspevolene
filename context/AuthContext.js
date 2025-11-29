// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'guest' | 'user' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser.id);
      } else {
        setRole('guest');
      }
      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser.id);
      } else {
        setRole('guest');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setRole(data.role);
    } else {
      setRole('user'); // fallback
    }
  };

// context/AuthContext.js
const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // 1) Kalau Supabase kasih error (misal: "User already registered")
  if (error) {
    // khusus kalau pesan dari Supabase = user sudah terdaftar
    if (
      error.message &&
      error.message.toLowerCase().includes('user already registered')
    ) {
      throw new Error('Email sudah terdaftar. Silakan login.');
    }

    // error lain (password kependekan, dll)
    throw error;
  }

  // 2) Beberapa konfigurasi Supabase: email sudah ada TAPI tidak di-error-kan
  //    Kalau data ada tapi data.user null/aneh, kita anggap email sudah dipakai.
  if (!data || !data.user) {
    throw new Error(
      'Email sudah terdaftar. Silakan login atau reset password.'
    );
  }

  const newUser = data.user;

  // buat profile default user
  const { error: profileError } = await supabase.from('profiles').insert({
    id: newUser.id,
    role: 'user',
  });

  if (profileError) {
    console.error('Gagal membuat profile:', profileError);
  }

  setUser(newUser);
  setRole('user');
  return newUser;
};


  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const currentUser = data.user;
    setUser(currentUser);
    if (currentUser) {
      await fetchUserRole(currentUser.id);
    }
    return currentUser;
  };

const signOut = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setRole('guest');
  location.reload(); 
};


  return (
    <AuthContext.Provider
      value={{ user, role, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
