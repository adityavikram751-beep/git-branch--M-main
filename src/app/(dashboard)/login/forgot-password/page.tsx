'use client';
import React, { useState } from 'react';
import { Lock, Phone, Key, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    newPassword: '',
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(''); // Store JWT token from OTP verification
  const router = useRouter();

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestOtp = async (e : any) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.phone) {
      setError('Please enter your phone number');
      setIsLoading(false);
      return;
    }

    const payload = { phone: formData.phone };

    try {
      const res = await fetch('https://barber-syndicate.vercel.app/api/v1/user/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Forget Password API response:', data);

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Failed to send OTP. Please try again.');
      }

      setSuccess('OTP sent successfully to your phone number.');
      setStep(2);
    } catch (err: any) {
      console.error('OTP request error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.phone || !formData.otp) {
      setError('Please enter the OTP');
      setIsLoading(false);
      return;
    }

    const payload = {
      phone: formData.phone,
      otp: parseInt(formData.otp),
    };

    try {
      const res = await fetch('https://barber-syndicate.vercel.app/api/v1/user/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Verify OTP API response:', data);

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Invalid OTP. Please try again.');
      }

      setToken(data.token); // Store the JWT token
      setSuccess('OTP verified successfully!');
      setStep(3);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.newPassword) {
      setError('Please enter your new password');
      setIsLoading(false);
      return;
    }

    const payload = {
      password: formData.newPassword,
    };

    try {
      const res = await fetch('https://barber-syndicate.vercel.app/api/v1/user/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include JWT token
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Change Password API response:', data);

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Failed to change password. Please try again.');
      }

      setSuccess(data.message || 'Password updated successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err:any) {
      console.error('Change Password error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Enter your phone number to receive an OTP';
      case 2:
        return 'Enter the OTP sent to your phone';
      case 3:
        return 'Create your new password';
      default:
        return 'Reset Your Password';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
            <p className="text-purple-100 mt-1">{getStepTitle()}</p>
            <div className="flex justify-center mt-4 space-x-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-3 h-3 rounded-full ${
                    stepNum <= step ? 'bg-white' : 'bg-purple-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="px-8 py-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}
            {step === 1 && (
              <form className="space-y-6" onSubmit={handleRequestOtp}>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pl-10"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}
            {step === 2 && (
              <form className="space-y-6" onSubmit={handleVerifyOtp}>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 pl-10"
                      value={formData.phone}
                      disabled
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    OTP *
                  </label>
                  <div className="relative">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pl-10"
                      placeholder="Enter the OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                    />
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-purple-600 py-2 px-4 rounded-lg font-medium hover:text-purple-700 transition-colors"
                >
                  Back to Phone Number
                </button>
              </form>
            )}
            {step === 3 && (
              <form className="space-y-6" onSubmit={handleChangePassword}>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pl-10"
                      placeholder="Enter your new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing Password...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full text-purple-600 py-2 px-4 rounded-lg font-medium hover:text-purple-700 transition-colors"
                >
                  Back to OTP Verification
                </button>
              </form>
            )}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Back to{' '}
                <Link
                  href="/login"
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;