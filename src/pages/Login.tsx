import React, { useState } from 'react';
import { DevErrorBoundary } from './ProductDetail';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Common redirect function for both login types
  const redirectAfterLogin = () => {
    if (location.state?.from && location.state.from !== '/login' && location.state.from !== '/account') {
      navigate(location.state.from, { replace: true });
    } else {
      navigate('/account', { replace: true });
    }
  };

  // 🔹 Create Firestore user doc if it doesn't exist
  const createUserDocIfMissing = async (user: any) => {
    const userRef = doc(collection(db, 'users'), user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phoneNumber || '',
        createdAt: new Date().toISOString(),
        receiveEmails: true
      });
    }
  };

  // 🔹 Link Google account with email/password if user wants
  const linkEmailPasswordToGoogle = async (password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const credential = EmailAuthProvider.credential(currentUser.email!, password);

    try {
      await linkWithCredential(currentUser, credential);
      console.log('Email/password linked to Google account');
    } catch (error: any) {
      if (error.code === 'auth/provider-already-linked') {
        console.log('Email/password already linked.');
      } else if (error.code === 'auth/email-already-in-use') {
        console.error('That email is already in use by another account.');
      } else {
        console.error('Error linking account:', error);
      }
    }
  };

  // 🔹 Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocIfMissing(userCredential.user);

      setShowSuccess(true);
      setFadeOut(false);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowSuccess(false);
          redirectAfterLogin();
        }, 400);
      }, 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  // 🔹 Google login
  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await createUserDocIfMissing(user);

      // ✅ Ask to link email/password login
      const newPassword = prompt('Set a password so you can also log in with email/password (leave blank to skip):');
      if (newPassword && newPassword.length >= 6) {
        await linkEmailPasswordToGoogle(newPassword);
      }

      setShowSuccess(true);
      setFadeOut(false);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowSuccess(false);
          redirectAfterLogin();
        }, 400);
      }, 900);
    } catch (error: any) {
      let errorMsg = 'Google login failed. Please try again.';
      if (error?.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Google sign-in was cancelled.';
      }
      setError(errorMsg);
    }
  };

  return (
    <DevErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {showSuccess && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`bg-white rounded-lg shadow-lg p-6 text-center transition-all duration-400 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <p className="text-green-700 text-lg font-semibold">Login successful</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
          {error && <div className="mb-4 text-red-600">{error}</div>}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <button type="submit" className="w-full bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800 font-medium">Log In</button>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Don't have an account?</span>
            <button type="button" className="ml-2 text-green-700 hover:underline" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                <span>Google</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </DevErrorBoundary>
  );
};

export default Login;
