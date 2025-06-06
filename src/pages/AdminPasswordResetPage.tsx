import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Lock, AlertTriangle, CheckCircle, Eye, EyeOff, Key, TestTube, Mail } from 'lucide-react';

const MANAGER_EMAILS = [
  'amy@straylite.com',
  'fred@replaymuseum.com',
  'play@replaymuseum.com',
  'brian@replaymuseum.com'
];

const AdminPasswordResetPage: React.FC = () => {
  const { user, isManager } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingPasswordEmail, setTestingPasswordEmail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If not authenticated or not a manager, redirect
  if (!user || !isManager) {
    return <Navigate to="/login" replace />;
  }

  const testEmailSystem = async () => {
    setTestingEmail(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setSuccess(`Test email sent successfully! Email ID: ${data.emailId}. Check your Resend logs.`);
    } catch (err) {
      console.error('Error testing email:', err);
      setError(`Email test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const testPasswordResetEmail = async () => {
    setTestingPasswordEmail(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/password-reset-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: 'onboarding@resend.dev',
          resetUrl: `${window.location.origin}/reset-password?test=true`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test password reset email');
      }

      setSuccess(`Password reset email test sent successfully! Email ID: ${data.emailId}`);
    } catch (err) {
      console.error('Error testing password reset email:', err);
      setError(`Password reset email test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTestingPasswordEmail(false);
    }
  };

  const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each required character type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special char
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    setNewPassword(generateSecurePassword());
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate inputs
    if (!selectedEmail) {
      setError('Please select an email address');
      setLoading(false);
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: selectedEmail,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(`Password successfully reset for ${selectedEmail}. A confirmation email has been sent.`);
      setSelectedEmail('');
      setNewPassword('');
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Key size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Admin Password Reset
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Reset passwords for manager accounts. A confirmation email will be sent to the user.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Email System Tests */}
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Email System Tests
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Test the email system to ensure it's working before resetting passwords
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={testEmailSystem}
                disabled={testingEmail}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <TestTube size={16} className="mr-2" />
                {testingEmail ? 'Testing...' : 'Test Basic Email'}
              </button>
              <button
                onClick={testPasswordResetEmail}
                disabled={testingPasswordEmail}
                className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                <Mail size={16} className="mr-2" />
                {testingPasswordEmail ? 'Testing...' : 'Test Password Reset Email'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-200 flex items-center">
            <CheckCircle size={20} className="mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Manager Account
            </label>
            <select
              id="email"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Choose an account to reset...</option>
              {MANAGER_EMAILS.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Generate Secure Password
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Password Requirements:
              </h4>
              <ul className="text-xs space-y-1">
                <li className={newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                  ✓ At least 8 characters long
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                  ✓ One uppercase letter
                </li>
                <li className={/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                  ✓ One lowercase letter
                </li>
                <li className={/\d/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                  ✓ One number
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                  ✓ One special character
                </li>
              </ul>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Security Notice
                </h4>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>The new password will be sent via email to the user</li>
                    <li>Users should change this password after their first login</li>
                    <li>This action will be logged for security purposes</li>
                    <li>Only use this for legitimate password reset requests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <Lock className="w-4 h-4 mr-2" />
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPasswordResetPage;