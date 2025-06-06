import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';
  const successMessage = (location.state as any)?.message;

  // Cooldown timer effect
  React.useEffect(() => {
    if (resetCooldown > 0) {
      const timer = setTimeout(() => setResetCooldown(resetCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resetCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err?.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (err?.message?.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a few minutes before trying again.');
      } else {
        setError('An error occurred while signing in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('rate limit') || 
            error.status === 429 || 
            error.message.includes('email rate limit exceeded') ||
            (error as any)?.code === 'over_email_send_rate_limit') {
          setResetCooldown(900); // 15 minutes
          throw new Error('You have made too many password reset requests. Please wait 15 minutes before trying again.');
        }
        throw error;
      }
      
      setResetSent(true);
      setResetCooldown(60); // 1 minute cooldown for successful requests
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Check Your Email
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Important:</strong> The reset link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
            </div>
            {resetCooldown > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can request another reset email in {formatCooldownTime(resetCooldown)}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setIsResetMode(false);
              setResetSent(false);
              setError('');
            }}
            className="mt-4 inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
            <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isResetMode ? 'Reset Password' : 'Employee Login'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isResetMode 
              ? 'Enter your email to receive a password reset link'
              : 'Please enter your email and password to sign in'
            }
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-200">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                {resetCooldown > 0 && error.includes('rate limit') && (
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    Cooldown: {formatCooldownTime(resetCooldown)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={isResetMode ? handlePasswordReset : handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
                placeholder="Enter your email address"
              />
            </div>
            {!isResetMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
                  placeholder="Enter your password"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (isResetMode && resetCooldown > 0)}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading || (isResetMode && resetCooldown > 0) ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                isResetMode ? 'Sending...' : 'Signing in...'
              ) : isResetMode ? (
                resetCooldown > 0 ? `Wait ${formatCooldownTime(resetCooldown)}` : 'Send Reset Link'
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setIsResetMode(!isResetMode);
                setError('');
                setResetSent(false);
              }}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              {isResetMode ? 'Back to Login' : 'Forgot your password?'}
            </button>
          </div>
        </form>

        {/* Security Tips */}
        {isResetMode && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Security Tips:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Reset links expire after 1 hour for security</li>
              <li>• Check your spam folder if you don't see the email</li>
              <li>• Only use this feature if you've forgotten your password</li>
              <li>• Contact an administrator if you continue having issues</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;