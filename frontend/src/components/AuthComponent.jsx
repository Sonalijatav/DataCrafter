import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, RefreshCcw } from 'lucide-react';

const AuthComponent = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // login | signup | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // const backendUrl = 'http://localhost:5000';
  const backendUrl = import.meta.env.VITE_API_URL;

  const getContext = () => {
    return mode === 'signup' ? 'signup' : 'reset';
  };

  const handleSendOtp = async () => {
    if (!email) return setError('Please enter your email');
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${backendUrl}/api/users/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, context: getContext() }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setOtpSent(true);
        setError('✅ OTP sent to your email');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error, please try again');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setError('Enter OTP');
    if (!email) return setError('Email is missing');
  
    try {
      setLoading(true);
      let endpoint = `${backendUrl}/api/users/verify-otp`;
      let body = { email, otp };
  
      if (mode === 'signup') {
        endpoint = `${backendUrl}/api/users/verify-otp-signup`;
      }
  
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await res.json();
      
      if (data.success) {
        setOtpVerified(true);
        if (mode === 'signup') {
          setError('✅ OTP verified. Now set your password.');
        } else {
          setError('✅ OTP verified. You can now reset your password.');
        }
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (error) {
      setError('Error verifying OTP');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) return setError('Enter and confirm new password');
    if (password !== confirmPassword) return setError("Passwords don't match");
    
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setError('✅ Password reset successful. Please login.');
        setMode('login');
        resetForm();
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Server error');
    }
    setLoading(false);
  };

  const handleAuth = async () => {
    setError('');
    if (!email) return setError('Email is required');

    if (mode === 'login') {
      if (!password) return setError('Password is required');
      
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/api/users/login-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await res.json();
        
        if (data.success && data.user && data.token) {
          localStorage.setItem('token', data.token);
          onLogin(data.user, data.token);
        } else {
          setError(data.message || 'Invalid login credentials');
        }
      } catch (error) {
        setError('Network error, try again');
      }
      setLoading(false);
    }

    if (mode === 'signup') {
      if (!otpSent || !otpVerified) {
        return setError('Please complete OTP verification first');
      }
      if (!password || !confirmPassword) {
        return setError('Set and confirm your password');
      }
      if (password !== confirmPassword) {
        return setError("Passwords don't match");
      }

      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/api/users/verify-otp-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, password }),
        });
        
        const data = await res.json();
        
        if (data.success && data.user && data.token) {
          localStorage.setItem('token', data.token);
          onLogin(data.user, data.token);
        } else {
          setError(data.message || 'Signup failed');
        }
      } catch (error) {
        setError('Network error, try again');
      }
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setError('');
    setShowPassword(false);
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const isErrorSuccess = error.startsWith('✅');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-cyan-50 px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-cyan-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-cyan-600 bg-clip-text text-transparent">
            {{
              login: 'Login to Your Account',
              signup: 'Register a New Account',
              reset: 'Reset Your Password',
            }[mode]}
          </h2>
          <p className="text-slate-500 text-sm"> Welcome to Data Crafter</p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-5 pr-4 py-3 border rounded-lg border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                disabled={otpSent && mode !== 'login'}
              />
            </div>
          </div>

          {/* OTP flow for signup/reset */}
          {(mode === 'signup' || mode === 'reset') && (
            <>
              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              ) : !otpVerified ? (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                      className="w-full px-4 py-3 border rounded-lg border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                    />
                    <button
                      title="Resend OTP"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 px-4 rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                    >
                      <RefreshCcw className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </>
              ) : null}
            </>
          )}

          {/* Password Fields */}
          {(mode === 'login' || (mode === 'signup' && otpVerified) || (mode === 'reset' && otpVerified)) && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'reset' ? 'Enter new password' : 'Enter password'}
                    className="w-full pl-5 pr-12 py-3 border rounded-lg border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {(mode === 'signup' || mode === 'reset') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 border rounded-lg border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                  />
                </div>
              )}
            </>
          )}

          {/* Submit button */}
          {mode === 'login' && (
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          )}
          
          {mode === 'signup' && otpVerified && (
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Creating Account...' : 'Complete Signup'}
            </button>
          )}
          
          {mode === 'reset' && otpVerified && (
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          )}

          {/* Error or Success message */}
          {error && (
            <div className={`text-center text-sm p-3 rounded-lg ${
              isErrorSuccess 
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                : 'text-red-700 bg-red-50 border border-red-200'
            }`}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="text-center space-y-2 mt-6">
            {mode !== 'reset' && (
              <button
                onClick={() => toggleMode(mode === 'login' ? 'signup' : 'login')}
                className="text-cyan-600 hover:text-cyan-700 hover:underline text-sm font-medium block transition-colors"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up with OTP"
                  : 'Already registered? Login with Password'}
              </button>
            )}
            
            {mode !== 'reset' && (
              <button
                onClick={() => toggleMode('reset')}
                className="text-slate-600 hover:text-slate-700 hover:underline text-xs block transition-colors"
              >
                Forgot Password? Reset via OTP
              </button>
            )}
            
            {mode === 'reset' && (
              <button
                onClick={() => toggleMode('login')}
                className="text-slate-600 hover:text-slate-700 hover:underline text-xs block transition-colors"
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;





