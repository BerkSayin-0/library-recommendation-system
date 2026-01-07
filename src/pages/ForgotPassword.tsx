import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { handleResetPassword, handleConfirmResetPassword } from '../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleResetPassword(email);
      toast.success('Reset code sent to your email!');
      setStep(2);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to send reset code';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleConfirmResetPassword(email, code, newPassword);
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Reset Password' : 'Confirm New Password'}
          </h2>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestCode}>
            <input
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              disabled={isLoading}
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleConfirm}>
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              disabled={isLoading}
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Updating...' : 'Confirm Reset'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
