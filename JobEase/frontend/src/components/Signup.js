import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.displayName);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      let msg = 'Failed to create account.';
      if (error.code === 'auth/email-already-in-use') msg = 'Email is already in use.';
      if (error.code === 'auth/weak-password') msg = 'Password is too weak.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vintage-cream px-4 py-12">
      <div className="vintage-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-vintage-navy mb-2">Create Account</h2>
          <p className="text-vintage-dark/70 font-sans">Begin your professional journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-vintage-navy mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              className="vintage-input"
              value={formData.displayName}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-vintage-navy mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="vintage-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-vintage-navy mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="vintage-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-vintage-navy mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="vintage-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="vintage-button mt-2">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-vintage-dark/70">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-vintage-navy hover:text-vintage-gold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
