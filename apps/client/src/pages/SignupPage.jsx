import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'participant',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }
    setLoading(true);
    try {
      await signup(formData);
      showToast('Account created! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-xl p-6 sm:p-8 space-y-6 glass-panel shadow-2xl">
        <div className="space-y-2 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-accent-primary text-white font-bold text-lg flex items-center justify-center">
              F
            </div>
            <span className="font-display font-bold text-xl uppercase tracking-wider text-text-primary">
              FORGE
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-text-primary">Create an account</h1>
          <p className="text-xs text-text-secondary">Join FORGE to participate, organize, or judge hackathons</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
              Account Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-surface border border-border-subtle rounded-md px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-secondary"
            >
              <option value="participant">Participant (Builder)</option>
              <option value="organizer">Organizer (Event Runner)</option>
            </select>
          </div>

          <Button type="submit" isLoading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-text-secondary pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary hover:underline font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
