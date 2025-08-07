import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, CheckIcon, XIcon } from 'lucide-react';
import { db } from '../firebase';
import { collection, setDoc, doc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
export const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    receiveEmails: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Password strength criteria
  const passwordCriteria = [{
    label: 'At least 8 characters',
    test: (pass: string) => pass.length >= 8
  }, {
    label: 'At least one uppercase letter',
    test: (pass: string) => /[A-Z]/.test(pass)
  }, {
    label: 'At least one lowercase letter',
    test: (pass: string) => /[a-z]/.test(pass)
  }, {
    label: 'At least one number',
    test: (pass: string) => /[0-9]/.test(pass)
  }, {
    label: 'At least one special character',
    test: (pass: string) => /[^A-Za-z0-9]/.test(pass)
  }];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const failedCriteria = passwordCriteria.filter(criterion => !criterion.test(formData.password));
      if (failedCriteria.length > 0) {
        newErrors.password = 'Password does not meet requirements';
      }
    }
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    // Validate terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const auth = getAuth();
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      // Optionally update display name
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      // Store user profile in Firestore
      await setDoc(doc(collection(db, 'users'), user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString(),
        receiveEmails: formData.receiveEmails
      });
      // Redirect to account page
      navigate('/account');
    } catch (error: any) {
      let errorMsg = 'There was an error creating your account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak.';
      }
      setErrors({
        form: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              Create Your Account
            </h1>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Join StarSeedz Nursery to start your plant journey
            </p>
            {errors.form && <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {errors.form}
                    </h3>
                  </div>
                </div>
              </div>}
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={`mt-1 block w-full border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={`mt-1 block w-full border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>}
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} className={`mt-1 block w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number (optional)
                </label>
                <input type="tel" id="phone" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} className={`block w-full border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">
                    {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                {/* Password strength indicators */}
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-700">
                    Password must contain:
                  </h4>
                  <ul className="mt-1 space-y-1">
                    {passwordCriteria.map((criterion, index) => <li key={index} className="flex items-center text-xs">
                        {criterion.test(formData.password) ? <CheckIcon className="h-4 w-4 text-green-500 mr-1" /> : <XIcon className="h-4 w-4 text-gray-300 mr-1" />}
                        <span className={criterion.test(formData.password) ? 'text-green-700' : 'text-gray-500'}>
                          {criterion.label}
                        </span>
                      </li>)}
                  </ul>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`block w-full border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">
                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>}
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="agreeToTerms" name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms-of-service" className="text-green-700 hover:text-green-800">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="text-green-700 hover:text-green-800">
                        Privacy Policy
                      </Link>
                    </label>
                    {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">
                        {errors.agreeToTerms}
                      </p>}
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="receiveEmails" name="receiveEmails" type="checkbox" checked={formData.receiveEmails} onChange={handleChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="receiveEmails" className="font-medium text-gray-700">
                      I want to receive promotional emails about special offers,
                      new products and gardening tips
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </> : 'Create Account'}
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-700 hover:text-green-800">
                  Sign in
                </Link>
              </p>
            </div>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <span className="sr-only">Sign up with Google</span>
                      
              <svg className="h-5 w-5" viewBox="0 0 150 150" width="24" height="24"><path fill="#4285F4" d="M120 76.1c0-3.1-.3-6.3-.8-9.3H75.9v17.7h24.8c-1 5.7-4.3 10.7-9.2 13.9l14.8 11.5C115 101.8 120 90 120 76.1z"/><path fill="#34A853" d="M75.9 120.9c12.4 0 22.8-4.1 30.4-11.1L91.5 98.4c-4.1 2.8-9.4 4.4-15.6 4.4-12 0-22.1-8.1-25.8-18.9L34.9 95.6C42.7 111.1 58.5 120.9 75.9 120.9z"/><path fill="#FBBC05" d="M50.1 83.8c-1.9-5.7-1.9-11.9 0-17.6L34.9 54.4c-6.5 13-6.5 28.3 0 41.2L50.1 83.8z"/><path fill="#EA4335" d="M75.9 47.3c6.5-.1 12.9 2.4 17.6 6.9L106.6 41C98.3 33.2 87.3 29 75.9 29.1c-17.4 0-33.2 9.8-41 25.3l15.2 11.8C53.8 55.3 63.9 47.3 75.9 47.3z"/></svg>
                    <span className="ml-2">Google</span>
                  </a>
                </div>
                <div>
                  <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <span className="sr-only">Sign up with Facebook</span>
                    <svg className="h-5 w-5" fill="#4267B2" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
};