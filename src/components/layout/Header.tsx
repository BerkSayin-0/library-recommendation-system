import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { showSuccess, handleApiError } from '@/utils/errorHandling';
import { updatePassword, updateUserAttributes, confirmUserAttribute } from 'aws-amplify/auth';

/**
 * Modern Header component with Profile Management & Email Verification (OTP)
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profil Form State
  const [profileForm, setProfileForm] = useState({
    email: user?.email || '',
    oldPassword: '',
    newPassword: '',
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMobileMenuOpen(false);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    try {
      // 1. Şifre Değiştirme
      if (profileForm.newPassword) {
        if (!profileForm.oldPassword) {
          throw new Error('Current password is required to set a new one.');
        }
        await updatePassword({
          oldPassword: profileForm.oldPassword,
          newPassword: profileForm.newPassword,
        });
        showSuccess('Password updated successfully.');
      }

      // 2. Email Güncelleme
      if (profileForm.email && profileForm.email.trim() !== user?.email) {
        await updateUserAttributes({
          userAttributes: { email: profileForm.email.trim() },
        });
        setShowVerificationStep(true);
        showSuccess('Verification code sent to your new email.');
        return;
      }

      handleCloseModal();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yeni Email Doğrulama (OTP) Fonksiyonu
  const handleVerifyEmail = async () => {
    setIsSubmitting(true);
    try {
      await confirmUserAttribute({
        userAttributeKey: 'email',
        confirmationCode: verificationCode,
      });
      showSuccess('Email updated and verified successfully!');
      handleCloseModal();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsProfileModalOpen(false);
    setShowVerificationStep(false);
    setVerificationCode('');
    setProfileForm({
      email: user?.email || '',
      oldPassword: '',
      newPassword: '',
    });
  };

  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-xl group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-110">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold gradient-text">LibraryAI</span>
          </Link>

          <div className="hidden md:block">
            <Navigation />
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors group"
                >
                  <span className="text-sm font-semibold text-slate-700">
                    Hi, <span className="text-violet-600">{user.name}</span>
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Settings</span>
                    </button>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-violet-600 transition-colors font-semibold px-4 py-2 rounded-lg hover:bg-violet-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/30 font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-violet-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <Navigation mobile />
            {user && (
              <div className="mt-4 pt-4 border-t border-slate-100 px-4 space-y-2">
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 font-semibold text-slate-700"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 font-semibold text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Management Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={handleCloseModal} title="Profile Settings">
        {!showVerificationStep ? (
          /* ADIM 1: Bilgi Girişi */
          <div className="space-y-4 pt-2">
            <Input
              label="Email Address"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
            <div className="border-t border-slate-100 pt-4 mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Change Password</p>
              <Input
                label="Current Password"
                type="password"
                value={profileForm.oldPassword}
                onChange={(e) => setProfileForm({ ...profileForm, oldPassword: e.target.value })}
              />
              <Input
                label="New Password"
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleUpdateProfile}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="secondary" className="flex-1" onClick={handleCloseModal}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* ADIM 2: Doğrulama Kodu Girişi */
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
              <p className="text-sm text-violet-800">
                A verification code has been sent to <strong>{profileForm.email}</strong>. Please
                enter it below to confirm your new email address.
              </p>
            </div>
            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleVerifyEmail}
                disabled={isSubmitting || !verificationCode}
              >
                {isSubmitting ? 'Verifying...' : 'Confirm New Email'}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowVerificationStep(false)}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </header>
  );
}
